const { createAffiliate, listAffiliates, affiliateStats } = require('../services/affiliates.service');
const { notifyAffiliateApproved, notifyAffiliateRejected } = require('../services/notifications.service');

async function create(req, res, next) {
  try {
    const affiliate = await createAffiliate(req.body);
    res.status(201).json(affiliate);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const items = await listAffiliates();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const { userId } = req.user || {};
    const data = await affiliateStats(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function applyToBeAffiliate(req, res, next) {
  try {
    console.log('=== AFFILIATE APPLICATION REQUEST ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Extraer datos del formulario
    const {
      dni,
      termsAccepted,
      yapePhone,
      'bankAccount[bank]': bankName,
      'bankAccount[number]': accountNumber
    } = req.body;

    console.log('Extracted data:', {
      userId,
      dni,
      termsAccepted,
      yapePhone,
      bankName,
      accountNumber
    });

    if (!dni || !termsAccepted) {
      return res.status(400).json({ 
        error: 'DNI y aceptación de términos son requeridos' 
      });
    }

    // Crear la solicitud de afiliado
    const applicationData = {
      userId,
      dni,
      termsAccepted: termsAccepted === 'true',
      status: 'pending',
      appliedAt: new Date(),
      paymentMethods: {}
    };

    // Agregar métodos de pago si están disponibles
    if (bankName && accountNumber) {
      applicationData.paymentMethods.bankAccount = {
        bank: bankName,
        number: accountNumber
      };
    }

    if (yapePhone) {
      applicationData.paymentMethods.yape = yapePhone;
    }

    console.log('Application data to save:', applicationData);

    // Por ahora, simplemente devolvemos éxito
    // En una implementación completa, guardarías esto en la base de datos
    res.status(201).json({
      message: 'Solicitud de afiliado enviada exitosamente',
      applicationId: `app_${Date.now()}`,
      status: 'pending'
    });

  } catch (err) {
    console.error('Error in applyToBeAffiliate:', err);
    next(err);
  }
}

module.exports = { create, list, stats, applyToBeAffiliate };



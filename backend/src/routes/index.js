const { Router } = require('express');

const users = require('./users');
const affiliates = require('./affiliates');
const affiliateDocuments = require('./affiliate-documents');
const services = require('./services');
const orders = require('./orders');
const transactions = require('./transactions');
const categories = require('./categories');
const uploads = require('./uploads');
const payments = require('./payments');
const reviews = require('./reviews');
const configCheck = require('./config-check');
const admin = require('./admin');
const affiliatePayments = require('./affiliate-payments');
const notifications = require('./notifications');
const disputes = require('./disputes');
const reports = require('./reports');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

// Endpoints de desarrollo
if (process.env.NODE_ENV === 'development') {
  router.get('/test-email', async (req, res) => {
    try {
      const { sendEmail } = require('../utils/email');
      const sent = await sendEmail({
        to: 'lloydtj01@gmail.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>'
      });
      res.json({ sent, message: sent ? 'Email sent' : 'Email failed' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/debug/users', async (req, res) => {
    try {
      const User = require('../models/User');
      const users = await User.find({}, 'email role name').limit(10);
      res.json({ users, count: users.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/debug/create-admin', async (req, res) => {
    try {
      const User = require('../models/User');
      const { hashPassword } = require('../utils/auth');
      
      // Verificar si ya existe un admin
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.json({ message: 'Admin already exists', admin: existingAdmin.email });
      }

      // Crear admin
      const hashedPassword = await hashPassword('admin123456');
      const admin = await User.create({
        role: 'admin',
        name: 'Admin System',
        email: 'admin@amazongroup.com',
        password: hashedPassword,
      });

      res.json({ message: 'Admin created', admin: admin.email });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

router.use('/users', users);
router.use('/affiliates', affiliates);
router.use('/affiliate-documents', affiliateDocuments);
router.use('/services', services);
router.use('/orders', orders);
router.use('/transactions', transactions);
router.use('/categories', categories);
router.use('/uploads', uploads);
router.use('/payments', payments);
router.use('/reviews', reviews);
router.use('/config', configCheck);
router.use('/admin', admin);
router.use('/admin/reports', reports);
router.use('/affiliate-payments', affiliatePayments);
router.use('/notifications', notifications);
router.use('/disputes', disputes);

module.exports = router;



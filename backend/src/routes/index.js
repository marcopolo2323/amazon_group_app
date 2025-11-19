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

// Endpoint de prueba para email (solo desarrollo)
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



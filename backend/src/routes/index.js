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

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

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

module.exports = router;



const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getDownloadLink,
  getCertificate,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('buyer', 'artist'), createOrder);
router.post('/:id/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/download', protect, authorize('buyer', 'artist'), getDownloadLink);
router.get('/:id/certificate', protect, authorize('buyer', 'artist'), getCertificate);

module.exports = router;

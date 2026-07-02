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

router.post('/', protect, authorize('buyer'), createOrder);
router.post('/:id/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/download', protect, authorize('buyer'), getDownloadLink);
router.get('/:id/certificate', protect, authorize('buyer'), getCertificate);

module.exports = router;

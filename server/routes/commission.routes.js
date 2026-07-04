const express = require('express');
const router = express.Router();
const {
  createCommission,
  getMyCommissions,
  respondToCommission,
  addCommissionReply,
} = require('../controllers/commission.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, authorize('buyer'), createCommission);
router.get('/', protect, getMyCommissions);
router.put('/:id/respond', protect, authorize('artist'), respondToCommission);
router.post('/:id/reply', protect, upload.single('image'), addCommissionReply);

module.exports = router;

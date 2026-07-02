const express = require('express');
const router = express.Router();
const {
  createCommission,
  getMyCommissions,
  respondToCommission,
} = require('../controllers/commission.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('buyer'), createCommission);
router.get('/', protect, getMyCommissions);
router.put('/:id/respond', protect, authorize('artist'), respondToCommission);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAdminStats, getArtistAnalytics } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/analytics/artist', protect, authorize('artist'), getArtistAnalytics);

module.exports = router;

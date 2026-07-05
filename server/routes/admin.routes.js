const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getArtistAnalytics,
  getPendingArtworks,
  approveArtwork,
  rejectArtwork,
  getSettings,
  updateSettings,
  getAuditLogs,
  dismissArtworkReports,
  warnUser
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/analytics/artist', protect, authorize('artist'), getArtistAnalytics);

// Admin-only management endpoints
router.get('/artworks/pending', protect, authorize('admin'), getPendingArtworks);
router.put('/artworks/:id/approve', protect, authorize('admin'), approveArtwork);
router.put('/artworks/:id/reject', protect, authorize('admin'), rejectArtwork);
router.get('/settings', protect, authorize('admin'), getSettings);
router.put('/settings', protect, authorize('admin'), updateSettings);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);
router.put('/artworks/:id/dismiss-reports', protect, authorize('admin'), dismissArtworkReports);
router.post('/users/:id/warn', protect, authorize('admin'), warnUser);

module.exports = router;

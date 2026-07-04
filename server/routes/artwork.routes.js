const express = require('express');
const router = express.Router();
const {
  createArtwork,
  getArtworks,
  getArtwork,
  getMyArtworks,
  updateArtwork,
  deleteArtwork,
  getRelatedArtworks,
  incrementView,
  reportArtwork,
} = require('../controllers/artwork.controller');
const { placeBid } = require('../controllers/bid.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getArtworks);
router.get('/my-artworks', protect, authorize('artist'), getMyArtworks);
router.get('/:id', getArtwork);
router.get('/:id/related', getRelatedArtworks);
router.post('/:id/view', incrementView);

// Protected routes
router.post('/', protect, authorize('artist'), upload.single('image'), createArtwork);
router.put('/:id', protect, authorize('artist', 'admin'), upload.single('image'), updateArtwork);
router.delete('/:id', protect, authorize('artist', 'admin'), deleteArtwork);
router.post('/:id/report', protect, reportArtwork);
router.post('/:id/bid', protect, authorize('buyer', 'artist'), placeBid);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.get('/check/:artworkId', protect, checkWishlist);
router.post('/:artworkId', protect, addToWishlist);
router.delete('/:artworkId', protect, removeFromWishlist);

module.exports = router;

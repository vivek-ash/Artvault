const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  firebaseAuth,
  firebaseRegister,
  checkEmail,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/check-email', checkEmail);
router.post('/firebase-auth', firebaseAuth);
router.post('/firebase-register', firebaseRegister);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

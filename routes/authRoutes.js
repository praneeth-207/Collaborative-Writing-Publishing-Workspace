const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, deleteProfile, refresh, logout, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// @route   POST /api/auth/refresh
router.post('/refresh', refresh);

// @route   POST /api/auth/logout
router.post('/logout', protect, logout);

// @route   GET /api/auth/profile
router.get('/profile', protect, getProfile);

// @route   DELETE /api/auth/profile
router.delete('/profile', protect, deleteProfile);

// @route   POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits'),
  ],
  verifyOTP
);

// @route   POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  resendOTP
);

// @route   POST /api/auth/forgotpassword
router.post(
  '/forgotpassword',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  forgotPassword
);

// @route   PUT /api/auth/resetpassword/:resettoken
router.put(
  '/resetpassword/:resettoken',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  resetPassword
);

module.exports = router;

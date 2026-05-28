const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, deleteProfile } = require('../controllers/authController');
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

// @route   GET /api/auth/profile
router.get('/profile', protect, getProfile);

// @route   DELETE /api/auth/profile
router.delete('/profile', protect, deleteProfile);

module.exports = router;

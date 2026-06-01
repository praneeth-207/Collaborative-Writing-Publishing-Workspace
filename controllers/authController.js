const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const { name, email, password } = req.body;
    const data = await authService.registerUser({ name, email, password });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const data = await authService.getProfile(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current user profile (delete account)
 * @route   DELETE /api/auth/profile
 * @access  Private
 */
const deleteProfile = async (req, res, next) => {
  try {
    const result = await authService.deleteUserAccount(req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new ErrorResponse('Refresh token is required', 400));
    }

    const data = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (revoke refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const result = await authService.logoutUser(req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, deleteProfile, refresh, logout };

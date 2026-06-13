const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/ErrorResponse');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * Register a new user.
 */
const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      throw new ErrorResponse('User with this email already exists', 400);
    }
    // If exists but is NOT verified, update the name and password and reuse the account, sending a new OTP
    user.name = name;
    user.password = password;
  } else {
    // Create new user (unverified by default)
    user = new User({ name, email, password });
  }

  // Generate OTP
  const otp = user.generateOTP();
  await user.save();

  // Send email with OTP
  const message = `Welcome to Collaborative Writing Workspace! Your 6-digit verification code is: ${otp}. This code is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      message,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }

  return {
    message: 'Registration successful. Please verify your email with the OTP sent to your inbox.',
  };
};

/**
 * Login user and return token.
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new ErrorResponse('Please verify your email address to log in', 400);
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    refreshToken,
  };
};

/**
 * Get user profile by ID.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  return user;
};

/**
 * Delete user account and cascade delete all associated data.
 */
const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // 1. Find all workspaces owned by the user
  const ownedWorkspaces = await Workspace.find({ owner: userId }).select('_id');
  const ownedWorkspaceIds = ownedWorkspaces.map((w) => w._id);

  // 2. Find all documents in those workspaces OR authored by the user
  const documentsToDelete = await Document.find({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { author: userId },
    ],
  }).select('_id');
  const documentIdsToDelete = documentsToDelete.map((d) => d._id);

  // 3. Delete comments on those documents OR comments made by the user
  await Comment.deleteMany({
    $or: [
      { documentId: { $in: documentIdsToDelete } },
      { userId },
    ],
  });

  // 4. Delete all the documents
  await Document.deleteMany({ _id: { $in: documentIdsToDelete } });

  // 5. Delete activity logs related to these workspaces or this user
  await ActivityLog.deleteMany({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { userId },
    ],
  });

  // 6. Delete workspaces owned by the user
  await Workspace.deleteMany({ _id: { $in: ownedWorkspaceIds } });

  // 7. Remove the user from other workspaces' members list
  await Workspace.updateMany(
    { 'members.user': userId },
    { $pull: { members: { user: userId } } }
  );

  // 8. Delete the user
  await User.findByIdAndDelete(userId);

  return { message: 'User account and all associated data deleted successfully' };
};

/**
 * Verify a refresh token and return a new access token.
 */
const refreshAccessToken = async (token) => {
  if (!token) {
    throw new ErrorResponse('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123_abc');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new ErrorResponse('Invalid refresh token', 401);
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new ErrorResponse('Invalid or expired refresh token', 401);
  }
};

/**
 * Revoke a user's refresh token (logout).
 */
const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  user.refreshToken = null;
  await user.save();

  return { message: 'Logged out successfully' };
};

/**
 * Verify OTP and activate user account.
 */
const verifyOTP = async ({ email, otpCode }) => {
  const user = await User.findOne({ email }).select('+otpCode +otpExpire');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  if (user.isVerified) {
    throw new ErrorResponse('User is already verified', 400);
  }

  if (!user.otpCode || user.otpCode !== otpCode) {
    throw new ErrorResponse('Invalid OTP code', 400);
  }

  if (user.otpExpire < Date.now()) {
    throw new ErrorResponse('OTP code has expired', 400);
  }

  // Activate user
  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpire = undefined;

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    refreshToken,
  };
};

/**
 * Resend OTP code to user's email.
 */
const resendOTP = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  if (user.isVerified) {
    throw new ErrorResponse('User is already verified', 400);
  }

  // Generate new OTP
  const otp = user.generateOTP();
  await user.save();

  // Send new OTP
  const message = `Your new verification code is: ${otp}. This code is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'New Email Verification OTP',
      message,
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
  }

  return {
    message: 'OTP resent successfully.',
  };
};

/**
 * Forgot password - generates token and sends email
 */
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse('There is no user with that email', 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });
  } catch (error) {
    // If mail fails, clear the token fields and throw error
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Password reset email could not be sent:', error);
    throw new ErrorResponse('Email could not be sent', 500);
  }

  return { message: 'Email sent successfully.' };
};

/**
 * Reset password
 */
const resetPassword = async ({ resetToken, newPassword }) => {
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Find user by token and expiry
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorResponse('Invalid or expired token', 400);
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return { message: 'Password reset successful.' };
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  deleteUserAccount,
  refreshAccessToken,
  logoutUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};

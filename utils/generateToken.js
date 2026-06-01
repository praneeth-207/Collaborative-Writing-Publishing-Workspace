const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user ID.
 * @param {string} userId - Mongoose ObjectId of the user
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30m',
  });
};

/**
 * Generate a signed refresh JWT for the given user ID.
 * @param {string} userId - Mongoose ObjectId of the user
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123_abc', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

module.exports = {
  generateToken,
  generateRefreshToken,
};

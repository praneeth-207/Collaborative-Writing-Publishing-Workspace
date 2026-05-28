const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user ID.
 * @param {string} userId - Mongoose ObjectId of the user
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;

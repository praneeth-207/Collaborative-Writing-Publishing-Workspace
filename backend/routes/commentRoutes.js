const express = require('express');
const { body } = require('express-validator');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/comments
router.post(
  '/',
  [
    body('documentId').notEmpty().withMessage('Document ID is required'),
    body('comment').notEmpty().withMessage('Comment text is required'),
  ],
  addComment
);

// @route   GET /api/comments/:documentId
router.get('/:documentId', getComments);

module.exports = router;

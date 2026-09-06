const express = require('express');
const { body } = require('express-validator');
const {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  publishDocument,
  getPublicDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/documents/public/:id
// @desc    Get a public document
// @access  Public
router.get('/public/:id', getPublicDocument);

// All other routes require authentication
router.use(protect);

// @route   POST /api/documents
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Document title is required'),
    body('workspaceId').notEmpty().withMessage('Workspace ID is required'),
  ],
  createDocument
);

// @route   GET /api/documents/:id
router.get('/:id', getDocument);

// @route   PUT /api/documents/:id
router.put(
  '/:id',
  [body('title').optional().notEmpty().withMessage('Title cannot be empty')],
  updateDocument
);

// @route   DELETE /api/documents/:id
router.delete('/:id', deleteDocument);

// @route   POST /api/documents/:id/publish
router.post('/:id/publish', publishDocument);

module.exports = router;

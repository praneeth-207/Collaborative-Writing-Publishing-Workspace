const express = require('express');
const { body } = require('express-validator');
const {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  publishDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
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

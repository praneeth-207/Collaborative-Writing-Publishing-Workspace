const express = require('express');
const { body } = require('express-validator');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  manageMembers,
  getActivityLogs,
  getWorkspaceDocuments,
  leaveWorkspace,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// @route   POST /api/workspaces
router.post(
  '/',
  [body('name').notEmpty().withMessage('Workspace name is required')],
  createWorkspace
);

// @route   GET /api/workspaces
router.get('/', getWorkspaces);

// @route   GET /api/workspaces/:id
router.get('/:id', getWorkspace);

// @route   PUT /api/workspaces/:id
router.put(
  '/:id',
  authorize('owner'),
  [body('name').optional().notEmpty().withMessage('Workspace name cannot be empty')],
  updateWorkspace
);

// @route   DELETE /api/workspaces/:id
router.delete('/:id', authorize('owner'), deleteWorkspace);

// @route   POST /api/workspaces/:id/members
router.post(
  '/:id/members',
  authorize('owner'),
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('action')
      .isIn(['add', 'remove'])
      .withMessage('Action must be "add" or "remove"'),
    body('role')
      .optional()
      .isIn(['owner', 'editor', 'viewer'])
      .withMessage('Role must be owner, editor, or viewer'),
  ],
  manageMembers
);

// @route   GET /api/workspaces/:id/logs
router.get('/:id/logs', authorize('owner', 'editor', 'viewer'), getActivityLogs);

// @route   GET /api/workspaces/:id/documents
router.get('/:id/documents', getWorkspaceDocuments);

// @route   POST /api/workspaces/:id/leave
router.post('/:id/leave', leaveWorkspace);

module.exports = router;

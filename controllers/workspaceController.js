const { validationResult } = require('express-validator');
const workspaceService = require('../services/workspaceService');
const documentService = require('../services/documentService');
const { getWorkspaceLogs } = require('../services/activityLogService');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Create a workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
const createWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const { name, description } = req.body;
    const data = await workspaceService.createWorkspace({
      name,
      description,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workspaces for the current user
 * @route   GET /api/workspaces
 * @access  Private
 */
const getWorkspaces = async (req, res, next) => {
  try {
    const data = await workspaceService.getUserWorkspaces(req.user._id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workspace by ID
 * @route   GET /api/workspaces/:id
 * @access  Private
 */
const getWorkspace = async (req, res, next) => {
  try {
    const data = await workspaceService.getWorkspaceById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update workspace
 * @route   PUT /api/workspaces/:id
 * @access  Private (Owner)
 */
const updateWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const data = await workspaceService.updateWorkspace(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete workspace
 * @route   DELETE /api/workspaces/:id
 * @access  Private (Owner)
 */
const deleteWorkspace = async (req, res, next) => {
  try {
    const data = await workspaceService.deleteWorkspace(req.params.id, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add/Remove members to workspace
 * @route   POST /api/workspaces/:id/members
 * @access  Private (Owner)
 */
const manageMembers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const data = await workspaceService.manageMembers(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity logs for a workspace
 * @route   GET /api/workspaces/:id/logs
 * @access  Private
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const data = await getWorkspaceLogs(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all documents inside a workspace
 * @route   GET /api/workspaces/:id/documents
 * @access  Private (Workspace Member)
 */
const getWorkspaceDocuments = async (req, res, next) => {
  try {
    // 1. Verify workspace exists
    const workspace = await workspaceService.getWorkspaceById(req.params.id);
    const userId = req.user._id;

    // 2. Verify membership
    const isMember =
      workspace.owner._id.toString() === userId.toString() ||
      workspace.members.some((m) => m.user._id.toString() === userId.toString());

    if (!isMember) {
      return next(new ErrorResponse('You are not a member of this workspace', 403));
    }

    const data = await documentService.getDocumentsByWorkspace(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave a workspace
 * @route   POST /api/workspaces/:id/leave
 * @access  Private (Workspace Member, non-owner)
 */
const leaveWorkspace = async (req, res, next) => {
  try {
    const data = await workspaceService.leaveWorkspace(req.params.id, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  manageMembers,
  getActivityLogs,
  getWorkspaceDocuments,
  leaveWorkspace,
};

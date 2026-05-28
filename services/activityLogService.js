const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity event.
 * @param {Object} params
 * @param {string} params.workspaceId
 * @param {string|null} params.documentId
 * @param {string} params.userId
 * @param {string} params.action
 * @param {string} params.details
 */
const logActivity = async ({ workspaceId, documentId = null, userId, action, details = '' }) => {
  try {
    await ActivityLog.create({
      workspaceId,
      documentId,
      userId,
      action,
      details,
    });
  } catch (error) {
    // Logging should never break the main flow
    console.error('Activity log error:', error.message);
  }
};

/**
 * Get activity logs for a workspace.
 */
const getWorkspaceLogs = async (workspaceId, limit = 50) => {
  return await ActivityLog.find({ workspaceId })
    .populate('userId', 'name email')
    .populate('documentId', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = { logActivity, getWorkspaceLogs };

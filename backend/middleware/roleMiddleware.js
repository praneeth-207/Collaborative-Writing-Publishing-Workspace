const Workspace = require('../models/Workspace');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Authorize access based on workspace membership role.
 * @param  {...string} roles - Allowed roles (e.g. 'owner', 'editor', 'viewer')
 *
 * Usage: authorize('owner', 'editor')
 *
 * This middleware expects `req.params.id` or `req.body.workspaceId` to contain
 * the workspace ID. It also checks if the user is a system admin.
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Safety check in case protect middleware is missing or out of order
      if (!req.user) {
        return next(new ErrorResponse('Not authorized', 401));
      }

      const workspaceId =
        req.params.id || req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return next(new ErrorResponse('Workspace ID is required', 400));
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return next(new ErrorResponse('Workspace not found', 404));
      }

      // Attach workspace so controllers can use it
      req.workspace = workspace;

      // System admins bypass workspace-level membership/owner checks
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user is the workspace owner
      if (workspace.owner.toString() === req.user._id.toString()) {
        req.workspace = workspace;
        return next();
      }

      // Check membership
      const member = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return next(
          new ErrorResponse('Not a member of this workspace', 403)
        );
      }

      if (!roles.includes(member.role)) {
        return next(
          new ErrorResponse(
            `Role '${member.role}' is not authorized for this action`,
            403
          )
        );
      }

      req.workspace = workspace;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize };

const Workspace = require('../models/Workspace');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const { logActivity } = require('./activityLogService');

/**
 * Create a new workspace.
 */
const createWorkspace = async ({ name, description, userId }) => {
  const workspace = await Workspace.create({
    name,
    description,
    owner: userId,
    members: [{ user: userId, role: 'owner' }],
  });

  await logActivity({
    workspaceId: workspace._id,
    userId,
    action: 'workspace_created',
    details: `Workspace "${name}" created`,
  });

  return workspace;
};

/**
 * Get all workspaces for a user (owned or member).
 */
const getUserWorkspaces = async (userId) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  return workspaces;
};

/**
 * Get a single workspace by ID.
 */
const getWorkspaceById = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  return workspace;
};

/**
 * Update workspace details.
 */
const updateWorkspace = async (workspaceId, updateData, user) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  const userId = user._id;

  // Only owner or admin can update
  if (workspace.owner.toString() !== userId.toString() && user.role !== 'admin') {
    throw new ErrorResponse('Only the workspace owner can update it', 403);
  }

  const updated = await Workspace.findByIdAndUpdate(workspaceId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  await logActivity({
    workspaceId,
    userId,
    action: 'workspace_updated',
    details: `Workspace updated`,
  });

  return updated;
};

/**
 * Delete a workspace.
 */
const deleteWorkspace = async (workspaceId, user) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  const userId = user._id;

  if (workspace.owner.toString() !== userId.toString() && user.role !== 'admin') {
    throw new ErrorResponse('Only the workspace owner can delete it', 403);
  }

  await logActivity({
    workspaceId,
    userId,
    action: 'workspace_deleted',
    details: `Workspace "${workspace.name}" deleted`,
  });

  await Workspace.findByIdAndDelete(workspaceId);

  return { message: 'Workspace deleted successfully' };
};

/**
 * Add or update a member in a workspace.
 * Body: { email, role, action: 'add' | 'remove' }
 */
const manageMembers = async (workspaceId, { email, role, action }, user) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  const userId = user._id;

  // Only owner can manage members
  if (workspace.owner.toString() !== userId.toString() && user.role !== 'admin') {
    throw new ErrorResponse('Only the workspace owner can manage members', 403);
  }

  const targetUser = await User.findOne({ email });
  if (!targetUser) {
    throw new ErrorResponse('User not found with that email', 404);
  }

  if (action === 'add') {
    // Check if already a member
    const existingMember = workspace.members.find(
      (m) => m.user.toString() === targetUser._id.toString()
    );

    if (existingMember) {
      // Update role
      existingMember.role = role || existingMember.role;
    } else {
      workspace.members.push({
        user: targetUser._id,
        role: role || 'viewer',
      });
    }

    await workspace.save();

    await logActivity({
      workspaceId,
      userId,
      action: 'collaborator_added',
      details: `${targetUser.name} (${targetUser.email}) added as ${role || 'viewer'}`,
    });
  } else if (action === 'remove') {
    // Cannot remove the owner
    if (targetUser._id.toString() === workspace.owner.toString()) {
      throw new ErrorResponse('Cannot remove the workspace owner', 400);
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== targetUser._id.toString()
    );

    await workspace.save();

    await logActivity({
      workspaceId,
      userId,
      action: 'collaborator_removed',
      details: `${targetUser.name} (${targetUser.email}) removed`,
    });
  } else {
    throw new ErrorResponse('Invalid action. Use "add" or "remove"', 400);
  }

  const updated = await Workspace.findById(workspaceId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  return updated;
};

/**
 * Leave a workspace.
 */
const leaveWorkspace = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  // Cannot leave if you are the owner
  if (workspace.owner.toString() === userId.toString()) {
    throw new ErrorResponse('Workspace owner cannot leave the workspace. You must delete it or transfer ownership first.', 400);
  }

  // Check if user is a member
  const isMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString()
  );

  if (!isMember) {
    throw new ErrorResponse('You are not a member of this workspace', 400);
  }

  // Remove the member
  workspace.members = workspace.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );

  await workspace.save();

  await logActivity({
    workspaceId,
    userId,
    action: 'collaborator_removed',
    details: `User left the workspace`,
  });

  return { message: 'Successfully left the workspace' };
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  manageMembers,
  leaveWorkspace,
};

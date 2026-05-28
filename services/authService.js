const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/ErrorResponse');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user.
 */
const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('User with this email already exists', 400);
  }

  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

/**
 * Login user and return token.
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

/**
 * Get user profile by ID.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  return user;
};

/**
 * Delete user account and cascade delete all associated data.
 */
const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // 1. Find all workspaces owned by the user
  const ownedWorkspaces = await Workspace.find({ owner: userId }).select('_id');
  const ownedWorkspaceIds = ownedWorkspaces.map((w) => w._id);

  // 2. Find all documents in those workspaces OR authored by the user
  const documentsToDelete = await Document.find({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { author: userId },
    ],
  }).select('_id');
  const documentIdsToDelete = documentsToDelete.map((d) => d._id);

  // 3. Delete comments on those documents OR comments made by the user
  await Comment.deleteMany({
    $or: [
      { documentId: { $in: documentIdsToDelete } },
      { userId },
    ],
  });

  // 4. Delete all the documents
  await Document.deleteMany({ _id: { $in: documentIdsToDelete } });

  // 5. Delete activity logs related to these workspaces or this user
  await ActivityLog.deleteMany({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { userId },
    ],
  });

  // 6. Delete workspaces owned by the user
  await Workspace.deleteMany({ _id: { $in: ownedWorkspaceIds } });

  // 7. Remove the user from other workspaces' members list
  await Workspace.updateMany(
    { 'members.user': userId },
    { $pull: { members: { user: userId } } }
  );

  // 8. Delete the user
  await User.findByIdAndDelete(userId);

  return { message: 'User account and all associated data deleted successfully' };
};

module.exports = { registerUser, loginUser, getProfile, deleteUserAccount };

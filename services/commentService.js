const Comment = require('../models/Comment');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Add a comment to a document.
 */
const addComment = async ({ documentId, user, comment }) => {
  // Verify document exists
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw new ErrorResponse('Document not found', 404);
  }

  if (!user) {
    throw new ErrorResponse('Not authorized', 401);
  }

  // Verify membership in workspace (admins bypass)
  if (user.role !== 'admin') {
    const workspace = await Workspace.findById(doc.workspaceId);
    if (!workspace) {
      throw new ErrorResponse('Workspace not found for this document', 404);
    }

    const isOwner = workspace.owner.toString() === user._id.toString();
    const isMember = workspace.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (!isOwner && !isMember) {
      throw new ErrorResponse('You are not authorized to comment on this document', 403);
    }
  }

  const userId = user._id;
  const newComment = await Comment.create({
    documentId,
    userId,
    comment,
  });

  return await Comment.findById(newComment._id).populate('userId', 'name email');
};

/**
 * Get all comments for a document.
 */
const getCommentsByDocument = async (documentId, user) => {
  // Verify document exists
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw new ErrorResponse('Document not found', 404);
  }

  if (!user) {
    throw new ErrorResponse('Not authorized', 401);
  }

  // Verify membership in workspace (admins bypass)
  if (user.role !== 'admin') {
    const workspace = await Workspace.findById(doc.workspaceId);
    if (!workspace) {
      throw new ErrorResponse('Workspace not found for this document', 404);
    }

    const isOwner = workspace.owner.toString() === user._id.toString();
    const isMember = workspace.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (!isOwner && !isMember) {
      throw new ErrorResponse('You are not authorized to view comments for this document', 403);
    }
  }

  return await Comment.find({ documentId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

module.exports = { addComment, getCommentsByDocument };

const Comment = require('../models/Comment');
const Document = require('../models/Document');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Add a comment to a document.
 */
const addComment = async ({ documentId, userId, comment }) => {
  // Verify document exists
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw new ErrorResponse('Document not found', 404);
  }

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
const getCommentsByDocument = async (documentId) => {
  // Verify document exists
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw new ErrorResponse('Document not found', 404);
  }

  return await Comment.find({ documentId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

module.exports = { addComment, getCommentsByDocument };

const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const ErrorResponse = require('../utils/ErrorResponse');
const { logActivity } = require('./activityLogService');

/**
 * Create a new document inside a workspace.
 */
const createDocument = async ({ title, content, workspaceId, userId }) => {
  // Verify workspace exists
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  // Verify user is a member
  const isMember =
    workspace.owner.toString() === userId.toString() ||
    workspace.members.some((m) => m.user.toString() === userId.toString());

  if (!isMember) {
    throw new ErrorResponse('You are not a member of this workspace', 403);
  }

  const document = await Document.create({
    title,
    content: content || '',
    workspaceId,
    author: userId,
    collaborators: [userId],
    status: 'draft',
  });

  await logActivity({
    workspaceId,
    documentId: document._id,
    userId,
    action: 'document_created',
    details: `Document "${title}" created`,
  });

  return document;
};

/**
 * Get a document by ID.
 */
const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId)
    .populate('author', 'name email')
    .populate('collaborators', 'name email')
    .populate('workspaceId', 'name');

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  return document;
};

/**
 * Get all documents in a workspace.
 */
const getDocumentsByWorkspace = async (workspaceId) => {
  return await Document.find({ workspaceId })
    .populate('author', 'name email')
    .sort({ updatedAt: -1 });
};

/**
 * Update a document (edit / save draft).
 */
const updateDocument = async (documentId, updateData, userId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  // Update fields
  if (updateData.title !== undefined) document.title = updateData.title;
  if (updateData.content !== undefined) document.content = updateData.content;

  await document.save();

  await logActivity({
    workspaceId: document.workspaceId,
    documentId: document._id,
    userId,
    action: 'document_updated',
    details: `Document "${document.title}" updated`,
  });

  return document;
};

/**
 * Delete a document.
 */
const deleteDocument = async (documentId, userId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  await logActivity({
    workspaceId: document.workspaceId,
    documentId: document._id,
    userId,
    action: 'document_deleted',
    details: `Document "${document.title}" deleted`,
  });

  await Document.findByIdAndDelete(documentId);

  return { message: 'Document deleted successfully' };
};

/**
 * Publish or unpublish a document.
 */
const togglePublish = async (documentId, userId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  document.status = document.status === 'draft' ? 'published' : 'draft';
  await document.save();

  const action =
    document.status === 'published' ? 'document_published' : 'document_unpublished';

  await logActivity({
    workspaceId: document.workspaceId,
    documentId: document._id,
    userId,
    action,
    details: `Document "${document.title}" ${document.status}`,
  });

  return document;
};

module.exports = {
  createDocument,
  getDocumentById,
  getDocumentsByWorkspace,
  updateDocument,
  deleteDocument,
  togglePublish,
};

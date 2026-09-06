const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const ErrorResponse = require('../utils/ErrorResponse');
const { logActivity } = require('./activityLogService');

/**
 * Helper to check permissions on a workspace.
 * @param {string} workspaceId - ID of the workspace
 * @param {Object} user - Requesting user object
 * @param {Array<string>} allowedRoles - Roles allowed for this action (e.g. ['owner', 'editor'])
 * @returns {Workspace} The fetched workspace
 */
const verifyWorkspacePermission = async (workspaceId, user, allowedRoles = []) => {
  if (!user) {
    throw new ErrorResponse('Not authorized', 401);
  }

  // System admins bypass all workspace checks
  if (user.role === 'admin') {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ErrorResponse('Workspace not found', 404);
    }
    return workspace;
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ErrorResponse('Workspace not found', 404);
  }

  // Check if owner
  if (workspace.owner.toString() === user._id.toString()) {
    return workspace;
  }

  // Check membership
  const member = workspace.members.find(
    (m) => m.user.toString() === user._id.toString()
  );

  if (!member) {
    throw new ErrorResponse('You are not a member of this workspace', 403);
  }

  // Check specific roles if provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
    throw new ErrorResponse(
      `Role '${member.role}' is not authorized for this action`,
      403
    );
  }

  return workspace;
};

/**
 * Create a new document inside a workspace.
 */
const createDocument = async ({ title, content, workspaceId, user }) => {
  // Only owner or editor can create documents (admins bypass)
  await verifyWorkspacePermission(workspaceId, user, ['owner', 'editor']);

  const userId = user._id;
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
const getDocumentById = async (documentId, user) => {
  const document = await Document.findById(documentId)
    .populate('author', 'name email')
    .populate('collaborators', 'name email')
    .populate('workspaceId', 'name');

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  // Verify workspace membership (admins bypass)
  await verifyWorkspacePermission(document.workspaceId._id || document.workspaceId, user);

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
const updateDocument = async (documentId, updateData, user) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  // Only owner or editor can update documents (admins bypass)
  await verifyWorkspacePermission(document.workspaceId, user, ['owner', 'editor']);

  // Update fields
  if (updateData.title !== undefined) document.title = updateData.title;
  if (updateData.content !== undefined) document.content = updateData.content;

  await document.save();

  const userId = user._id;
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
const deleteDocument = async (documentId, user) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  const workspace = await verifyWorkspacePermission(document.workspaceId, user);
  const userId = user._id;

  // Delete requires workspace owner, original author, or admin
  const isOwner = workspace.owner.toString() === userId.toString();
  const isAuthor = document.author.toString() === userId.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAuthor && !isAdmin) {
    throw new ErrorResponse('Not authorized to delete this document', 403);
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
const togglePublish = async (documentId, user) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ErrorResponse('Document not found', 404);
  }

  // Only owner or editor can publish (admins bypass)
  await verifyWorkspacePermission(document.workspaceId, user, ['owner', 'editor']);

  document.status = document.status === 'draft' ? 'published' : 'draft';
  await document.save();

  const action =
    document.status === 'published' ? 'document_published' : 'document_unpublished';

  const userId = user._id;
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

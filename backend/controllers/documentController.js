const { validationResult } = require('express-validator');
const documentService = require('../services/documentService');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Create a document
 * @route   POST /api/documents
 * @access  Private
 */
const createDocument = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const { title, content, workspaceId } = req.body;
    const data = await documentService.createDocument({
      title,
      content,
      workspaceId,
      user: req.user,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
const getDocument = async (req, res, next) => {
  try {
    const data = await documentService.getDocumentById(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update document
 * @route   PUT /api/documents/:id
 * @access  Private (Editor+)
 */
const updateDocument = async (req, res, next) => {
  try {
    const data = await documentService.updateDocument(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private (Owner)
 */
const deleteDocument = async (req, res, next) => {
  try {
    const data = await documentService.deleteDocument(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish / Unpublish a document
 * @route   POST /api/documents/:id/publish
 * @access  Private (Editor+)
 */
const publishDocument = async (req, res, next) => {
  try {
    const data = await documentService.togglePublish(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a public document by ID
 * @route   GET /api/documents/public/:id
 * @access  Public
 */
const getPublicDocument = async (req, res, next) => {
  try {
    const data = await documentService.getPublicDocumentById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  publishDocument,
  getPublicDocument,
};

const { validationResult } = require('express-validator');
const commentService = require('../services/commentService');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Add a comment to a document
 * @route   POST /api/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array().map((e) => e.msg).join(', '), 400));
    }

    const { documentId, comment } = req.body;
    const data = await commentService.addComment({
      documentId,
      userId: req.user._id,
      comment,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a document
 * @route   GET /api/comments/:documentId
 * @access  Private
 */
const getComments = async (req, res, next) => {
  try {
    const data = await commentService.getCommentsByDocument(req.params.documentId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments };

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'document_created',
        'document_updated',
        'document_published',
        'document_unpublished',
        'document_deleted',
        'collaborator_added',
        'collaborator_removed',
        'workspace_created',
        'workspace_updated',
        'workspace_deleted',
      ],
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);

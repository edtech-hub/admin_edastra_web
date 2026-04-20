const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'login', 'logout'],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['auth', 'admin', 'system'], default: 'system', index: true },
    action: { type: String, required: true },
    level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    ip: String,
    details: String,
  },
  { timestamps: true }
);

// Keep logs for 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

activityLogSchema.statics.record = function record(req, data) {
  return this.create({
    ip: req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req?.ip,
    ...data,
  }).catch((e) => console.error('Failed to write activity log:', e.message));
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);

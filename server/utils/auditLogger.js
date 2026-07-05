const AuditLog = require('../models/AuditLog');

/**
 * Logs an administrative or critical platform action.
 * @param {string} action - The type of action (e.g. 'user_suspended', 'artwork_approved')
 * @param {string} details - Detailed human-readable text explanation of the action
 * @param {string} [userId] - Optional Mongoose ObjectId of the actor (user performing the action)
 */
exports.logActivity = async (action, details, userId = null) => {
  try {
    await AuditLog.create({
      action,
      details,
      user: userId,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

/** Usage: authorize('admin', 'developer') — must run after protect. */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to do that' });
  }
  return next();
};

const isStaff = (user) => !!user && ['admin', 'developer'].includes(user.role);

module.exports = { authorize, isStaff };

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const getSecret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

async function resolveUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const decoded = jwt.verify(token, getSecret());
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) return null;
  return user;
}

/** Requires a valid token. */
async function protect(req, res, next) {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ success: false, message: 'Please sign in to continue' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
  }
}

/** Attaches req.user when a valid token is present, otherwise continues anonymously. */
async function optionalAuth(req, res, next) {
  try {
    req.user = (await resolveUser(req)) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
}

module.exports = { protect, optionalAuth, signToken };

const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect, signToken } = require('../middlewares/auth.middleware');
const { asyncHandler, HttpError, pick } = require('../utils/helpers');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

const PUBLIC_ROLES = ['tourist', 'resident', 'business_owner'];

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = pick(req.body, ['firstName', 'lastName', 'email', 'password', 'phone', 'role']);
    if (!PUBLIC_ROLES.includes(data.role)) data.role = 'tourist';
    if (!data.password || data.password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');

    const exists = await User.exists({ email: (data.email || '').toLowerCase().trim() });
    if (exists) throw new HttpError(409, 'An account with this email already exists');

    const user = await User.create({ ...data, lastLogin: new Date() });
    ActivityLog.record(req, { type: 'auth', action: 'register', user: user._id, email: user.email });
    res.status(201).json({ success: true, token: signToken(user), user });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const { password } = req.body;
    if (!email || !password) throw new HttpError(400, 'Email and password are required');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      ActivityLog.record(req, { type: 'auth', action: 'login_failed', level: 'warning', email });
      throw new HttpError(401, 'Incorrect email or password');
    }
    if (!user.isActive) {
      ActivityLog.record(req, { type: 'auth', action: 'login_blocked', level: 'warning', user: user._id, email });
      throw new HttpError(403, 'This account has been deactivated. Contact the tourism office.');
    }

    user.lastLogin = new Date();
    await user.save();
    ActivityLog.record(req, { type: 'auth', action: 'login', user: user._id, email });
    res.json({ success: true, token: signToken(user), user });
  })
);

router.post('/logout', protect, (req, res) => {
  ActivityLog.record(req, { type: 'auth', action: 'logout', user: req.user._id, email: req.user.email });
  res.json({ success: true, message: 'Signed out' });
});

router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    Object.assign(req.user, pick(req.body, ['firstName', 'lastName', 'phone', 'avatar']));
    await req.user.save();
    res.json({ success: true, user: req.user });
  })
);

router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword || ''))) throw new HttpError(400, 'Current password is incorrect');
    if (!newPassword || newPassword.length < 8) throw new HttpError(400, 'New password must be at least 8 characters');
    user.password = newPassword;
    await user.save();
    ActivityLog.record(req, { type: 'auth', action: 'password_changed', user: user._id, email: user.email });
    res.json({ success: true, message: 'Password updated' });
  })
);

module.exports = router;

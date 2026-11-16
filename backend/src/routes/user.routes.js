const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const TouristSpot = require('../models/TouristSpot.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError, escapeRegex } = require('../utils/helpers');

const router = express.Router();

/* ---------- Favorites (any signed-in user) ---------- */

router.get(
  '/me/favorites',
  protect,
  asyncHandler(async (req, res) => {
    await req.user.populate({ path: 'favorites', match: { isActive: true } });
    res.json({ success: true, data: req.user.favorites.filter(Boolean) });
  })
);

router.post(
  '/me/favorites/:spotId',
  protect,
  asyncHandler(async (req, res) => {
    const { spotId } = req.params;
    if (!mongoose.isValidObjectId(spotId) || !(await TouristSpot.exists({ _id: spotId }))) {
      throw new HttpError(404, 'Tourist spot not found');
    }
    const has = req.user.favorites.some((f) => f.toString() === spotId);
    if (has) req.user.favorites.pull(spotId);
    else req.user.favorites.addToSet(spotId);
    await req.user.save();
    res.json({ success: true, favorited: !has, favorites: req.user.favorites });
  })
);

/* ---------- User management (admin) ---------- */

router.get(
  '/',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const { q, role } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(1000);
    res.json({ success: true, count: users.length, data: users });
  })
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ success: true, data: user });
  })
);

// PATCH /api/users/:id { role?, isActive? }
router.patch(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    if (user._id.equals(req.user._id)) throw new HttpError(400, 'You cannot change your own role or status');

    const { role, isActive } = req.body;
    if (role !== undefined) {
      if (!User.ROLES.includes(role)) throw new HttpError(400, 'Invalid role');
      if (role === 'developer' && req.user.role !== 'developer') throw new HttpError(403, 'Only developers can grant the developer role');
      user.role = role;
    }
    if (isActive !== undefined) user.isActive = !!isActive;
    await user.save();
    ActivityLog.record(req, {
      type: 'admin',
      action: 'user_updated',
      user: req.user._id,
      details: `${user.email} → role: ${user.role}, active: ${user.isActive}`,
    });
    res.json({ success: true, data: user });
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) throw new HttpError(400, 'You cannot delete your own account here');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    ActivityLog.record(req, { type: 'admin', action: 'user_deleted', user: req.user._id, details: user.email });
    res.json({ success: true, message: 'User deleted' });
  })
);

module.exports = router;

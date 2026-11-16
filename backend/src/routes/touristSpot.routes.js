const express = require('express');
const TouristSpot = require('../models/TouristSpot.model');
const Review = require('../models/Review.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize, isStaff } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError, uniqueSlug, idOrSlug, pick, escapeRegex } = require('../utils/helpers');

const router = express.Router();
const FIELDS = ['name', 'tagline', 'description', 'category', 'location', 'images', 'highlights', 'entranceFee', 'openingHours', 'featured', 'isActive'];

const clean = (body) => {
  const data = pick(body, FIELDS);
  if (typeof data.images === 'string') data.images = data.images.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  if (typeof data.highlights === 'string') data.highlights = data.highlights.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  return data;
};

// GET /api/tourist-spots?q=&category=&featured=true&sort=popular|rating|newest&limit=&all=1
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { q, category, featured, sort = 'popular', limit, all } = req.query;
    const filter = {};
    if (!(all && isStaff(req.user))) filter.isActive = true;
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { tagline: rx }, { description: rx }, { 'location.address': rx }];
    }
    const sorts = { popular: { visitCount: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 }, name: { name: 1 } };
    const spots = await TouristSpot.find(filter)
      .sort(sorts[sort] || sorts.popular)
      .limit(Math.min(Number(limit) || 100, 200));
    res.json({ success: true, count: spots.length, data: spots });
  })
);

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = idOrSlug(req.params.id);
    if (!isStaff(req.user)) filter.isActive = true;
    const spot = await TouristSpot.findOneAndUpdate(filter, { $inc: { visitCount: 1 } }, { new: true });
    if (!spot) throw new HttpError(404, 'Tourist spot not found');
    const reviews = await Review.find({ spot: spot._id })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: spot, reviews });
  })
);

router.post(
  '/',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const data = clean(req.body);
    data.slug = await uniqueSlug(TouristSpot, data.name);
    data.createdBy = req.user._id;
    const spot = await TouristSpot.create(data);
    ActivityLog.record(req, { type: 'admin', action: 'spot_created', user: req.user._id, details: spot.name });
    res.status(201).json({ success: true, data: spot });
  })
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findOne(idOrSlug(req.params.id));
    if (!spot) throw new HttpError(404, 'Tourist spot not found');
    const data = clean(req.body);
    if (data.name && data.name !== spot.name) data.slug = await uniqueSlug(TouristSpot, data.name, spot._id);
    Object.assign(spot, data);
    await spot.save();
    ActivityLog.record(req, { type: 'admin', action: 'spot_updated', user: req.user._id, details: spot.name });
    res.json({ success: true, data: spot });
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findOneAndDelete(idOrSlug(req.params.id));
    if (!spot) throw new HttpError(404, 'Tourist spot not found');
    await Review.deleteMany({ spot: spot._id });
    ActivityLog.record(req, { type: 'admin', action: 'spot_deleted', user: req.user._id, details: spot.name });
    res.json({ success: true, message: 'Tourist spot deleted' });
  })
);

module.exports = router;

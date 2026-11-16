const express = require('express');
const Business = require('../models/Business.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize, isStaff } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError, uniqueSlug, idOrSlug, pick, escapeRegex } = require('../utils/helpers');

const router = express.Router();
const FIELDS = ['name', 'description', 'category', 'contact', 'location', 'priceRange', 'images', 'promotions'];

const clean = (body) => {
  const data = pick(body, FIELDS);
  if (typeof data.images === 'string') data.images = data.images.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  if (typeof data.promotions === 'string') data.promotions = data.promotions.split('\n').map((s) => s.trim()).filter(Boolean);
  return data;
};

const canManage = (user, business) =>
  isStaff(user) || (business.owner && business.owner.toString() === user._id.toString());

// GET /api/businesses?category=&q=&status=&all=1
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { category, q, status, all } = req.query;
    const filter = {};
    if (all && isStaff(req.user)) {
      if (status && status !== 'all') filter.status = status;
    } else {
      filter.status = 'approved';
    }
    if (category && category !== 'all') filter.category = category;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { 'contact.address': rx }];
    }
    const businesses = await Business.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, count: businesses.length, data: businesses });
  })
);

// GET /api/businesses/mine — the signed-in owner's listings
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const businesses = await Business.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: businesses });
  })
);

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const business = await Business.findOne(idOrSlug(req.params.id)).populate('owner', 'firstName lastName');
    if (!business) throw new HttpError(404, 'Business not found');
    if (business.status !== 'approved' && !(req.user && canManage(req.user, business))) {
      throw new HttpError(404, 'Business not found');
    }
    res.json({ success: true, data: business });
  })
);

router.post(
  '/',
  protect,
  authorize('business_owner', 'admin', 'developer'),
  asyncHandler(async (req, res) => {
    const data = clean(req.body);
    data.slug = await uniqueSlug(Business, data.name);
    data.owner = req.user._id;
    data.status = isStaff(req.user) ? 'approved' : 'pending';
    const business = await Business.create(data);
    ActivityLog.record(req, { type: 'admin', action: 'business_submitted', user: req.user._id, details: business.name });
    res.status(201).json({ success: true, data: business });
  })
);

router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const business = await Business.findOne(idOrSlug(req.params.id));
    if (!business) throw new HttpError(404, 'Business not found');
    if (!canManage(req.user, business)) throw new HttpError(403, 'You can only edit your own business');
    const data = clean(req.body);
    if (data.name && data.name !== business.name) data.slug = await uniqueSlug(Business, data.name, business._id);
    Object.assign(business, data);
    await business.save();
    res.json({ success: true, data: business });
  })
);

// PATCH /api/businesses/:id/status { status: 'approved' | 'rejected' | 'pending' }
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) throw new HttpError(400, 'Invalid status');
    const business = await Business.findOneAndUpdate(idOrSlug(req.params.id), { status }, { new: true });
    if (!business) throw new HttpError(404, 'Business not found');
    ActivityLog.record(req, { type: 'admin', action: `business_${status}`, user: req.user._id, details: business.name });
    res.json({ success: true, data: business });
  })
);

router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const business = await Business.findOne(idOrSlug(req.params.id));
    if (!business) throw new HttpError(404, 'Business not found');
    if (!canManage(req.user, business)) throw new HttpError(403, 'You can only delete your own business');
    await business.deleteOne();
    ActivityLog.record(req, { type: 'admin', action: 'business_deleted', user: req.user._id, details: business.name });
    res.json({ success: true, message: 'Business deleted' });
  })
);

module.exports = router;

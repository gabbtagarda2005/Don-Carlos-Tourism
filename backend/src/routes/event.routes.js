const express = require('express');
const Event = require('../models/Event.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize, isStaff } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError, uniqueSlug, idOrSlug, pick } = require('../utils/helpers');

const router = express.Router();
const FIELDS = ['title', 'description', 'date', 'endDate', 'location', 'category', 'images', 'featured', 'isActive'];

const clean = (body) => {
  const data = pick(body, FIELDS);
  if (typeof data.images === 'string') data.images = data.images.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  if (data.endDate === '') data.endDate = null;
  return data;
};

// GET /api/events?upcoming=true&limit=&all=1
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { upcoming, limit, all, category } = req.query;
    const filter = {};
    if (!(all && isStaff(req.user))) filter.isActive = true;
    if (category && category !== 'all') filter.category = category;
    if (upcoming === 'true') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      filter.$or = [{ date: { $gte: startOfToday } }, { endDate: { $gte: startOfToday } }];
    }
    const events = await Event.find(filter)
      .sort({ date: upcoming === 'true' ? 1 : -1 })
      .limit(Math.min(Number(limit) || 100, 200));
    res.json({ success: true, count: events.length, data: events });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const event = await Event.findOne({ ...idOrSlug(req.params.id), isActive: true });
    if (!event) throw new HttpError(404, 'Event not found');
    res.json({ success: true, data: event });
  })
);

router.post(
  '/',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const data = clean(req.body);
    data.slug = await uniqueSlug(Event, data.title);
    data.createdBy = req.user._id;
    const event = await Event.create(data);
    ActivityLog.record(req, { type: 'admin', action: 'event_created', user: req.user._id, details: event.title });
    res.status(201).json({ success: true, data: event });
  })
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const event = await Event.findOne(idOrSlug(req.params.id));
    if (!event) throw new HttpError(404, 'Event not found');
    const data = clean(req.body);
    if (data.title && data.title !== event.title) data.slug = await uniqueSlug(Event, data.title, event._id);
    Object.assign(event, data);
    await event.save();
    ActivityLog.record(req, { type: 'admin', action: 'event_updated', user: req.user._id, details: event.title });
    res.json({ success: true, data: event });
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const event = await Event.findOneAndDelete(idOrSlug(req.params.id));
    if (!event) throw new HttpError(404, 'Event not found');
    ActivityLog.record(req, { type: 'admin', action: 'event_deleted', user: req.user._id, details: event.title });
    res.json({ success: true, message: 'Event deleted' });
  })
);

module.exports = router;

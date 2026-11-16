const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const TouristSpot = require('../models/TouristSpot.model');
const Business = require('../models/Business.model');
const Event = require('../models/Event.model');
const Review = require('../models/Review.model');
const Message = require('../models/Message.model');
const Subscriber = require('../models/Subscriber.model');
const ActivityLog = require('../models/ActivityLog.model');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError } = require('../utils/helpers');

const router = express.Router();
router.use(protect, authorize('admin', 'developer'));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Count documents per month for the last 6 months. */
async function monthlyCounts(Model) {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
  ]);
  const out = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    const row = rows.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    out.push({ month: MONTHS[d.getMonth()], count: row ? row.count : 0 });
  }
  return out;
}

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      users, spots, businesses, pendingBusinesses, upcomingEvents, reviews, unreadMessages, subscribers,
      visitsAgg, byCategory, topSpots, usersByRole, userGrowth, reviewGrowth, recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      TouristSpot.countDocuments(),
      Business.countDocuments({ status: 'approved' }),
      Business.countDocuments({ status: 'pending' }),
      Event.countDocuments({ isActive: true, date: { $gte: startOfToday } }),
      Review.countDocuments(),
      Message.countDocuments({ isRead: false }),
      Subscriber.countDocuments(),
      TouristSpot.aggregate([{ $group: { _id: null, total: { $sum: '$visitCount' } } }]),
      TouristSpot.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, visits: { $sum: '$visitCount' } } }, { $sort: { visits: -1 } }]),
      TouristSpot.find().sort({ visitCount: -1 }).limit(5).select('name slug visitCount rating reviewCount category'),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      monthlyCounts(User),
      monthlyCounts(Review),
      ActivityLog.find().sort({ createdAt: -1 }).limit(8).populate('user', 'firstName lastName'),
    ]);

    const growth = userGrowth.map((u, i) => ({ month: u.month, users: u.count, reviews: reviewGrowth[i].count }));

    res.json({
      success: true,
      data: {
        totals: {
          users, spots, businesses, pendingBusinesses, upcomingEvents, reviews, unreadMessages, subscribers,
          visits: visitsAgg[0]?.total || 0,
        },
        byCategory: byCategory.map((c) => ({ category: c._id, count: c.count, visits: c.visits })),
        topSpots,
        usersByRole: usersByRole.map((r) => ({ role: r._id, count: r.count })),
        growth,
        recentActivity,
      },
    });
  })
);

/* ---------- Messages & subscribers ---------- */

router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, data: messages });
  })
);

router.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: !!req.body.isRead }, { new: true });
    if (!msg) throw new HttpError(404, 'Message not found');
    res.json({ success: true, data: msg });
  })
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) throw new HttpError(404, 'Message not found');
    res.json({ success: true, message: 'Message deleted' });
  })
);

router.get(
  '/subscribers',
  asyncHandler(async (req, res) => {
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  })
);

router.delete(
  '/subscribers/:id',
  asyncHandler(async (req, res) => {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber removed' });
  })
);

/* ---------- System & security ---------- */

router.get(
  '/logs',
  asyncHandler(async (req, res) => {
    const { type, level, limit } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (level && level !== 'all') filter.level = level;
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 1000))
      .populate('user', 'firstName lastName email');
    res.json({ success: true, data: logs });
  })
);

router.get(
  '/system',
  asyncHandler(async (req, res) => {
    const db = mongoose.connection.db;
    const started = Date.now();
    await db.admin().ping();
    const dbLatency = Date.now() - started;
    const stats = await db.stats();
    const collections = await Promise.all(
      [User, TouristSpot, Business, Event, Review, Message, Subscriber, ActivityLog].map(async (M) => ({
        name: M.collection.collectionName,
        count: await M.estimatedDocumentCount(),
      }))
    );
    const mem = process.memoryUsage();
    res.json({
      success: true,
      data: {
        status: 'operational',
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        memory: { rssMB: +(mem.rss / 1048576).toFixed(1), heapUsedMB: +(mem.heapUsed / 1048576).toFixed(1) },
        database: {
          name: db.databaseName,
          host: mongoose.connection.host,
          latencyMs: dbLatency,
          dataSizeKB: Math.round((stats.dataSize || 0) / 1024),
          storageSizeKB: Math.round((stats.storageSize || 0) / 1024),
          collections,
        },
        serverTime: new Date(),
      },
    });
  })
);

// Full JSON backup (passwords excluded)
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const [users, spots, businesses, events, reviews, messages, subscribers] = await Promise.all([
      User.find().lean(), TouristSpot.find().lean(), Business.find().lean(), Event.find().lean(),
      Review.find().lean(), Message.find().lean(), Subscriber.find().lean(),
    ]);
    users.forEach((u) => delete u.password);
    ActivityLog.record(req, { type: 'admin', action: 'data_exported', user: req.user._id });
    res.setHeader('Content-Disposition', `attachment; filename="don-carlos-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json({ exportedAt: new Date(), users, touristSpots: spots, businesses, events, reviews, messages, subscribers });
  })
);

module.exports = router;

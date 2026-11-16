const express = require('express');
const rateLimit = require('express-rate-limit');
const Message = require('../models/Message.model');
const Subscriber = require('../models/Subscriber.model');
const TouristSpot = require('../models/TouristSpot.model');
const Business = require('../models/Business.model');
const Event = require('../models/Event.model');
const Review = require('../models/Review.model');
const { asyncHandler, pick } = require('../utils/helpers');

const router = express.Router();

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

// Headline numbers for the landing page
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [spots, businesses, events, reviews] = await Promise.all([
      TouristSpot.countDocuments({ isActive: true }),
      Business.countDocuments({ status: 'approved' }),
      Event.countDocuments({ isActive: true, date: { $gte: startOfToday } }),
      Review.countDocuments(),
    ]);
    res.json({ success: true, data: { spots, businesses, events, reviews } });
  })
);

router.post(
  '/contact',
  formLimiter,
  asyncHandler(async (req, res) => {
    // Honeypot: real users never fill the hidden "website" field
    if (req.body.website) return res.status(201).json({ success: true, message: 'Thank you!' });
    await Message.create(pick(req.body, ['name', 'email', 'subject', 'message']));
    return res.status(201).json({ success: true, message: 'Thank you! The tourism office will get back to you soon.' });
  })
);

router.post(
  '/subscribe',
  formLimiter,
  asyncHandler(async (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const existing = await Subscriber.findOne({ email });
    if (!existing) await Subscriber.create({ email });
    res.status(201).json({ success: true, message: "You're on the list — see you in the highlands." });
  })
);

module.exports = router;

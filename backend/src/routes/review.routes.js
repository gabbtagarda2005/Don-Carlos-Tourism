const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review.model');
const TouristSpot = require('../models/TouristSpot.model');
const { protect } = require('../middlewares/auth.middleware');
const { authorize, isStaff } = require('../middlewares/role.middleware');
const { asyncHandler, HttpError } = require('../utils/helpers');

const router = express.Router();

// GET /api/reviews?spot=<id>  (public)  — without spot, admin only
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    if (!req.query.spot) return next();
    if (!mongoose.isValidObjectId(req.query.spot)) throw new HttpError(400, 'Invalid spot id');
    const reviews = await Review.find({ spot: req.query.spot })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: reviews });
  }),
  protect,
  authorize('admin', 'developer'),
  asyncHandler(async (req, res) => {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName email')
      .populate('spot', 'name slug')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ success: true, data: reviews });
  })
);

// POST /api/reviews { spot, rating, comment } — one review per user per spot (re-posting updates it)
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { spot, rating, comment } = req.body;
    if (!mongoose.isValidObjectId(spot) || !(await TouristSpot.exists({ _id: spot }))) {
      throw new HttpError(404, 'Tourist spot not found');
    }
    const r = Number(rating);
    if (!(r >= 1 && r <= 5)) throw new HttpError(400, 'Rating must be between 1 and 5');

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, spot },
      { rating: Math.round(r), comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'firstName lastName avatar');
    await Review.recalculate(spot);
    res.status(201).json({ success: true, data: review });
  })
);

router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new HttpError(404, 'Review not found');
    if (!isStaff(req.user) && review.user.toString() !== req.user._id.toString()) {
      throw new HttpError(403, 'You can only delete your own review');
    }
    await review.deleteOne();
    await Review.recalculate(review.spot);
    res.json({ success: true, message: 'Review deleted' });
  })
);

module.exports = router;

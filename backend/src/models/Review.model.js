const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'TouristSpot', required: true },
    rating: { type: Number, min: 1, max: 5, required: [true, 'Rating is required'] },
    comment: { type: String, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, spot: 1 }, { unique: true });

/** Recalculate the average rating stored on the spot. */
reviewSchema.statics.recalculate = async function recalculate(spotId) {
  const TouristSpot = mongoose.model('TouristSpot');
  const [agg] = await this.aggregate([
    { $match: { spot: new mongoose.Types.ObjectId(spotId) } },
    { $group: { _id: '$spot', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await TouristSpot.findByIdAndUpdate(spotId, {
    rating: agg ? Math.round(agg.avg * 10) / 10 : 0,
    reviewCount: agg ? agg.count : 0,
  });
};

module.exports = mongoose.model('Review', reviewSchema);

const mongoose = require('mongoose');

const CATEGORIES = ['nature', 'culture', 'adventure', 'scenic', 'food', 'accommodation'];

const touristSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 5000 },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    location: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    images: [String],
    highlights: [String],
    entranceFee: String,
    openingHours: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

touristSpotSchema.index({ name: 'text', description: 'text', tagline: 'text' });

module.exports = mongoose.model('TouristSpot', touristSpotSchema);
module.exports.CATEGORIES = CATEGORIES;

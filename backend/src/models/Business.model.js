const mongoose = require('mongoose');

const CATEGORIES = ['hotel', 'restaurant', 'resort', 'shop', 'transportation', 'service'];

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Business name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 3000 },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contact: {
      phone: String,
      email: String,
      address: String,
      website: String,
    },
    location: { latitude: Number, longitude: Number },
    priceRange: String,
    images: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    promotions: [String],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

businessSchema.virtual('isApproved').get(function isApproved() {
  return this.status === 'approved';
});

module.exports = mongoose.model('Business', businessSchema);
module.exports.CATEGORIES = CATEGORIES;

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 5000 },
    date: { type: Date, required: [true, 'Start date is required'] },
    endDate: Date,
    location: String,
    category: { type: String, default: 'Festival' },
    images: [String],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

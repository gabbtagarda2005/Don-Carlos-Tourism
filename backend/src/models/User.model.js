const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['tourist', 'resident', 'business_owner', 'admin', 'developer'];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 60 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: { type: String, trim: true },
    avatar: String,
    role: { type: String, enum: ROLES, default: 'tourist' },
    isActive: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TouristSpot' }],
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

userSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;

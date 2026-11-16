const path = require('path');
const sample = require('./sample-data.json');
const User = require('../models/User.model');
const TouristSpot = require('../models/TouristSpot.model');
const Business = require('../models/Business.model');
const Event = require('../models/Event.model');

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(8, 0, 0, 0);
  return d;
};

/** Create the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet. */
async function ensureAdmin() {
  if (await User.exists({ role: { $in: ['admin', 'developer'] } })) return null;
  const email = process.env.ADMIN_EMAIL || 'admin@doncarlos.gov.ph';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Promoted ${email} to admin`);
    return existing;
  }
  const admin = await User.create({ firstName: 'Tourism', lastName: 'Administrator', email, password, role: 'admin' });
  console.log(`Created admin account: ${email}`);
  return admin;
}

/** Insert sample content when the collections are empty. */
async function seedSampleData({ force = false } = {}) {
  const admin = await User.findOne({ role: 'admin' });

  if (force || (await TouristSpot.estimatedDocumentCount()) === 0) {
    if (force) await TouristSpot.deleteMany({});
    await TouristSpot.insertMany(sample.spots.map((s) => ({ ...s, createdBy: admin?._id })));
    console.log(`Seeded ${sample.spots.length} tourist spots`);
  }

  if (force || (await Event.estimatedDocumentCount()) === 0) {
    if (force) await Event.deleteMany({});
    await Event.insertMany(
      sample.events.map(({ daysFromNow: n, durationDays, image, ...e }) => ({
        ...e,
        date: daysFromNow(n),
        endDate: durationDays ? daysFromNow(n + durationDays) : undefined,
        images: [image],
        createdBy: admin?._id,
      }))
    );
    console.log(`Seeded ${sample.events.length} events`);
  }

  if (force || (await Business.estimatedDocumentCount()) === 0) {
    if (force) await Business.deleteMany({});
    await Business.insertMany(sample.businesses.map((b) => ({ ...b, status: 'approved', owner: admin?._id })));
    console.log(`Seeded ${sample.businesses.length} businesses`);
  }
}

module.exports = { ensureAdmin, seedSampleData };

// CLI: npm run seed  |  npm run seed:reset
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
  const mongoose = require('mongoose');
  const connectDB = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await ensureAdmin();
      await seedSampleData({ force: process.argv.includes('--reset') });
      console.log('Seeding complete');
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}

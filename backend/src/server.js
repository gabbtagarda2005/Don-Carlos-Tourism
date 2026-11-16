require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { ensureAdmin, seedSampleData } = require('./seed/seed');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set — using an insecure default. Set it in your environment.');
}

(async () => {
  try {
    await connectDB();
    await ensureAdmin();
    if (process.env.SEED_SAMPLE_DATA !== 'false') await seedSampleData();
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`Don Carlos Tourism API listening on port ${PORT}`));
})();

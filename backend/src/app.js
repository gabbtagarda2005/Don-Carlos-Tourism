const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Render / Vercel sit behind a proxy — needed for correct client IPs and rate limiting
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server / curl (no origin), everything when no list is configured,
      // listed origins, and wildcard entries like "*.vercel.app".
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*')) return cb(null, true);
      const ok = allowedOrigins.some((o) =>
        o.startsWith('*.') ? origin.endsWith(o.slice(1)) : o === origin
      );
      return cb(ok ? null : new Error(`Origin ${origin} is not allowed by CORS`), ok);
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ name: 'Don Carlos Tourism API', status: 'ok', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    database: states[mongoose.connection.readyState] || 'unknown',
    uptime: Math.round(process.uptime()),
    timestamp: new Date(),
  });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tourist-spots', require('./routes/touristSpot.routes'));
app.use('/api/businesses', require('./routes/business.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api', require('./routes/public.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

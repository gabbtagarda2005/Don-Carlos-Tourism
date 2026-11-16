// Built-in content (mirrors the backend seed) used while the API is waking up or unreachable.
import raw from './sample-data.json';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
};

export const sampleSpots = raw.spots.map((s) => ({ ...s, _id: s.slug, reviewCount: 0, isActive: true }));

export const sampleEvents = raw.events.map(({ daysFromNow: n, durationDays, image, ...e }) => ({
  ...e,
  _id: e.slug,
  date: daysFromNow(n),
  endDate: durationDays ? daysFromNow(n + durationDays) : null,
  images: [image],
  isActive: true,
}));

export const sampleBusinesses = raw.businesses.map((b) => ({ ...b, _id: b.slug, status: 'approved' }));

export const sampleStats = {
  spots: sampleSpots.length,
  businesses: sampleBusinesses.length,
  events: sampleEvents.length,
  reviews: 0,
};

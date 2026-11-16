const mongoose = require('mongoose');

/** Wrap async route handlers so errors reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/** Build a unique slug for a model, appending -2, -3 … when taken. */
async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base) || 'item';
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

/** Query that matches either an ObjectId or a slug. */
const idOrSlug = (value) =>
  mongoose.isValidObjectId(value) ? { $or: [{ _id: value }, { slug: value }] } : { slug: value };

/** Copy only allowed keys from a body. */
const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { asyncHandler, HttpError, slugify, uniqueSlug, idOrSlug, pick, escapeRegex };

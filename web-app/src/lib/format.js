export const SPOT_CATEGORIES = ['nature', 'scenic', 'adventure', 'culture', 'food', 'accommodation'];
export const BUSINESS_CATEGORIES = ['hotel', 'resort', 'restaurant', 'shop', 'transportation', 'service'];
export const ROLES = ['tourist', 'resident', 'business_owner', 'admin', 'developer'];

export const titleCase = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const BUSINESS_LABELS = {
  hotel: 'Hotels & Inns',
  resort: 'Resorts',
  restaurant: 'Food & Coffee',
  shop: 'Shops',
  transportation: 'Tours & Transport',
  service: 'Services',
};
export const businessLabel = (c) => BUSINESS_LABELS[c] || titleCase(c);

export const formatDate = (d, opts = { month: 'long', day: 'numeric', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-US', opts) : '';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

export function formatDateRange(start, end) {
  if (!start) return '';
  const s = new Date(start);
  if (!end) return formatDate(s);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', { month: 'long' })} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${formatDate(s, { month: 'short', day: 'numeric' })} – ${formatDate(e, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export const timeAgo = (d) => {
  const sec = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return 'just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [u, s] of units) {
    const n = Math.floor(sec / s);
    if (n >= 1) return `${n} ${u}${n > 1 ? 's' : ''} ago`;
  }
  return '';
};

/** Resize Unsplash images on the fly; leave other URLs untouched. */
export const img = (url, w = 1200) => {
  if (!url) return FALLBACK_IMAGE;
  if (url.includes('images.unsplash.com')) {
    const u = url.replace(/([?&])w=\d+/, `$1w=${w}`);
    return u.includes('w=') ? u : `${u}${u.includes('?') ? '&' : '?'}w=${w}&q=80&auto=format&fit=crop`;
  }
  return url;
};

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&q=80&auto=format&fit=crop';

export const linesToArray = (s = '') => s.split('\n').map((x) => x.trim()).filter(Boolean);

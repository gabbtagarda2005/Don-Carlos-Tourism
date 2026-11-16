import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Phone, Mail, Star } from 'lucide-react';
import { FadeImg } from './ui';
import { businessLabel, formatDate, img, titleCase } from '../lib/format';

export function SpotCard({ spot, tall = false }) {
  return (
    <Link to={`/spots/${spot.slug || spot._id}`} className="zoom-img group relative block overflow-hidden rounded-[1.75rem] bg-forest-900">
      <div className={`relative ${tall ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}>
        <FadeImg src={img(spot.images?.[0], 900)} alt={spot.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
        <span className="chip absolute left-5 top-5 bg-cream-50/90 text-forest-900 backdrop-blur">{titleCase(spot.category)}</span>
        <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/0 text-white transition-all duration-500 group-hover:bg-gold-400 group-hover:text-forest-950">
          <ArrowUpRight size={18} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          {spot.rating > 0 && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gold-300">
              <Star size={13} className="fill-gold-300" /> {Number(spot.rating).toFixed(1)}
              {spot.location?.address && <span className="truncate font-normal text-white/60">· {spot.location.address.split(',')[0]}</span>}
            </p>
          )}
          <h3 className="font-display text-3xl font-medium leading-tight">{spot.name}</h3>
          {spot.tagline && <p className="mt-1.5 line-clamp-2 text-sm text-white/70">{spot.tagline}</p>}
        </div>
      </div>
    </Link>
  );
}

export function EventRow({ event }) {
  const d = new Date(event.date);
  return (
    <article className="group grid grid-cols-[auto_1fr] items-center gap-6 border-b border-forest-900/10 py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-10">
      <div className="w-20 text-center">
        <p className="font-display text-6xl leading-none text-forest-900 transition-colors group-hover:text-gold-600">
          {String(d.getDate()).padStart(2, '0')}
        </p>
        <p className="eyebrow mt-2 text-forest-900/50">{d.toLocaleDateString('en-US', { month: 'short' })} {d.getFullYear()}</p>
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-gold-600">{event.category}</p>
        <h3 className="mt-2 font-display text-3xl leading-tight text-forest-900">{event.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-forest-900/60">
          <MapPin size={14} /> {event.location}
          {event.endDate && <span>· until {formatDate(event.endDate, { month: 'short', day: 'numeric' })}</span>}
        </p>
        {event.description && <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-forest-900/70">{event.description}</p>}
      </div>
      <div className="zoom-img hidden h-28 w-44 overflow-hidden rounded-2xl sm:block">
        <FadeImg src={img(event.images?.[0], 500)} alt="" className="h-full w-full object-cover" />
      </div>
    </article>
  );
}

export function BusinessCard({ business }) {
  return (
    <article className="zoom-img group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_0_rgba(0,0,0,.04)] ring-1 ring-forest-900/10 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(21,42,32,.35)]">
      <div className="relative aspect-[3/2] overflow-hidden bg-forest-100">
        <FadeImg src={img(business.images?.[0], 800)} alt={business.name} className="h-full w-full object-cover" />
        <span className="chip absolute left-4 top-4 bg-cream-50/90 text-forest-900 backdrop-blur">{businessLabel(business.category)}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-forest-900">{business.name}</h3>
          {business.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-forest-900">
              <Star size={14} className="fill-gold-400 text-gold-400" /> {Number(business.rating).toFixed(1)}
            </span>
          )}
        </div>
        {business.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-forest-900/65">{business.description}</p>}
        <div className="mt-auto space-y-1.5 pt-5 text-xs text-forest-900/60">
          {business.priceRange && <p className="font-semibold text-gold-700">{business.priceRange}</p>}
          {business.contact?.address && <p className="flex items-center gap-1.5"><MapPin size={13} /> {business.contact.address}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {business.contact?.phone && (
              <a href={`tel:${business.contact.phone}`} className="flex items-center gap-1.5 hover:text-forest-900"><Phone size={13} /> {business.contact.phone}</a>
            )}
            {business.contact?.email && (
              <a href={`mailto:${business.contact.email}`} className="flex items-center gap-1.5 hover:text-forest-900"><Mail size={13} /> Email</a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Dark hero band used at the top of inner pages. */
export function PageHero({ eyebrow, title, children, image }) {
  return (
    <section className="grain relative overflow-hidden bg-forest-950 pb-20 pt-40 text-cream-50 sm:pb-24 sm:pt-48">
      {image && (
        <img src={img(image, 1800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950" />
      <div className="container-x relative">
        <p className="eyebrow animate-rise text-gold-300">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl animate-rise font-display text-5xl font-medium leading-[1.02] [animation-delay:120ms] sm:text-7xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl animate-rise text-base leading-relaxed text-cream-100/75 [animation-delay:240ms] sm:text-lg">{children}</div>}
      </div>
    </section>
  );
}

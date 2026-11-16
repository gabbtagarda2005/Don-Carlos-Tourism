import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sunrise, Waves, Wheat, Sparkles, Bus, CalendarDays, Backpack, Send, Quote,
} from 'lucide-react';
import { useApi, api } from '../../lib/api';
import { sampleSpots, sampleEvents, sampleBusinesses, sampleStats } from '../../lib/sample';
import { img } from '../../lib/format';
import { Reveal, CountUp, Spinner, Alert } from '../../components/ui';
import { SpotCard, EventRow, BusinessCard } from '../../components/Cards';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=2400&q=80&auto=format&fit=crop',
    caption: 'Morning mist over the highland forests',
  },
  {
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=2400&q=80&auto=format&fit=crop',
    caption: 'Still waters of Lake Pinamaloy',
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80&auto=format&fit=crop',
    caption: 'A sea of clouds from the ridge at dawn',
  },
];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-forest-950 text-white">
      {SLIDES.map((s, idx) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={idx !== i}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full animate-kenburns object-cover"
            fetchpriority={idx === 0 ? 'high' : 'low'}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/25 to-forest-950/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/60 via-transparent to-transparent" />

      <div className="container-x relative flex h-full flex-col justify-end pb-28 sm:pb-32">
        <p className="eyebrow animate-rise text-gold-300 [animation-delay:200ms]">
          <span className="mr-3 inline-block h-px w-10 translate-y-[-3px] bg-gold-300 align-middle" />
          Bukidnon · Northern Mindanao
        </p>
        <h1 className="mt-6 max-w-5xl animate-rise font-display text-[3.4rem] font-medium leading-[0.95] tracking-tight [animation-delay:350ms] sm:text-8xl lg:text-[8.5rem]">
          Where the highlands <em className="font-normal text-gold-300">breathe.</em>
        </h1>
        <p className="mt-8 max-w-xl animate-rise text-base leading-relaxed text-white/80 [animation-delay:550ms] sm:text-lg">
          Misty lakes, hidden falls and skies thick with stars. Discover Don Carlos — a quiet corner of Mindanao
          where the land moves at the pace of the clouds.
        </p>
        <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:700ms]">
          <Link to="/explore" className="btn-gold">
            Begin exploring <ArrowRight size={16} />
          </Link>
          <Link to="/events" className="btn-ghost">
            Upcoming festivals
          </Link>
        </div>
      </div>

      {/* Bottom bar: slide caption + counter + scroll cue */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="container-x flex items-end justify-between gap-6 pb-8">
          <div className="hidden items-center gap-5 sm:flex">
            <div className="flex gap-2">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.image}
                  onClick={() => setI(idx)}
                  className="group relative h-8 w-10"
                  aria-label={`Show slide ${idx + 1}`}
                >
                  <span className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
                  <span
                    className={`absolute left-0 top-1/2 h-px bg-gold-300 transition-all duration-700 ${idx === i ? 'w-full' : 'w-0'}`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-white/70">
              <span className="font-semibold text-white">0{i + 1}</span> / 0{SLIDES.length} — {SLIDES[i].caption}
            </p>
          </div>
          <a href="#discover" className="ml-auto flex items-center gap-3 text-xs font-semibold uppercase tracking-widest2 text-white/70 hover:text-white">
            Scroll
            <span className="relative block h-12 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scrollcue bg-gold-300" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Intro({ stats }) {
  const items = [
    { value: stats.spots, label: 'Destinations to discover' },
    { value: stats.businesses, label: 'Local stays & kitchens' },
    { value: stats.events, label: 'Upcoming celebrations' },
  ];
  return (
    <section id="discover" className="relative bg-cream-50 py-28 sm:py-36">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow text-gold-600">An invitation</p>
          <div className="mt-6 h-px w-16 bg-forest-900/20" />
        </Reveal>
        <div className="lg:col-span-8">
          <Reveal as="p" className="font-display text-3xl leading-[1.25] text-forest-900 sm:text-[2.6rem]">
            Set on the cool plateau of southern Bukidnon, Don Carlos is farmland and forest, lake and ridge — a town
            of early mornings and long, golden afternoons. <span className="italic text-forest-600">Come slowly.</span>{' '}
            The best of it reveals itself to those who linger.
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-10 border-t border-forest-900/10 pt-10 sm:grid-cols-3">
            {items.map((it, idx) => (
              <Reveal key={it.label} delay={idx * 120}>
                <p className="font-display text-6xl text-forest-900 sm:text-7xl">
                  <CountUp value={it.value} />
                </p>
                <p className="mt-2 text-sm text-forest-900/60">{it.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Featured({ spots }) {
  const [first, ...rest] = spots;
  return (
    <section className="bg-cream-50 pb-28 sm:pb-36">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow text-gold-600">Featured destinations</p>
            <h2 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-[1.02] text-forest-900 sm:text-6xl">
              Places that stay <em className="text-forest-600">with you.</em>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <Link to="/explore" className="link-underline text-sm text-forest-900">
              View all destinations <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        {first && (
          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            <Reveal className="lg:col-span-7 lg:row-span-2">
              <Link to={`/spots/${first.slug || first._id}`} className="zoom-img group relative block h-full min-h-[460px] overflow-hidden rounded-[2rem] bg-forest-900">
                <img src={img(first.images?.[0], 1400)} alt={first.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                  <p className="eyebrow text-gold-300">Must visit · {first.category}</p>
                  <h3 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{first.name}</h3>
                  <p className="mt-4 max-w-md text-white/75">{first.tagline}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                    Discover <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
            {rest.slice(0, 2).map((s, idx) => (
              <Reveal key={s._id} delay={(idx + 1) * 120} className="lg:col-span-5">
                <SpotCard spot={s} />
              </Reveal>
            ))}
          </div>
        )}
        {rest.length > 2 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(2, 5).map((s, idx) => (
              <Reveal key={s._id} delay={idx * 120}>
                <SpotCard spot={s} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const EXPERIENCES = [
  { icon: Sunrise, title: 'Sunrise & mist', text: 'Climb before dawn and watch the valley fill with cloud as the first light breaks over the ridges.', to: '/explore?category=scenic' },
  { icon: Waves, title: 'Lakes & falls', text: 'Paddle a glass-still lake, then cool off in forest pools fed by clear mountain streams.', to: '/explore?category=nature' },
  { icon: Wheat, title: 'Farm & table', text: 'Walk the fields that feed the region and taste highland produce cooked the local way.', to: '/stays?category=restaurant' },
  { icon: Sparkles, title: 'Under the stars', text: 'Far from city light, camp in open grasslands beneath an impossibly bright Milky Way.', to: '/explore?category=adventure' },
];

function Experiences() {
  return (
    <section className="grain relative overflow-hidden bg-forest-950 py-28 text-cream-50 sm:py-36">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-forest-700/30 blur-3xl" />
      <div className="container-x relative">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <p className="eyebrow text-gold-300">Ways to experience</p>
            <h2 className="mt-4 font-display text-5xl font-medium leading-[1.02] sm:text-6xl">
              Four rhythms <br />
              <em className="text-gold-300">of the highlands.</em>
            </h2>
          </Reveal>
          <Reveal delay={150} as="p" className="max-w-md text-cream-100/70 lg:justify-self-end">
            Every day in Don Carlos follows the light — from the mist of early morning to the warmth of the harvest
            afternoon and the deep quiet of night.
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-cream-50/10 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCES.map((e, idx) => (
            <Reveal key={e.title} delay={idx * 100} className="bg-forest-950">
              <Link to={e.to} className="group flex h-full flex-col p-8 transition-colors duration-500 hover:bg-forest-900 sm:p-10">
                <div className="flex items-center justify-between">
                  <e.icon className="text-gold-300" size={30} strokeWidth={1.25} />
                  <span className="font-display text-xl text-cream-50/30">0{idx + 1}</span>
                </div>
                <h3 className="mt-16 font-display text-3xl">{e.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-100/60">{e.text}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest2 text-gold-300 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteBand() {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center bg-forest-900 bg-cover bg-center bg-fixed text-center text-white max-lg:bg-scroll"
      style={{ backgroundImage: `url(${img('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2400&q=80&auto=format&fit=crop', 2400)})` }}
    >
      <div className="absolute inset-0 bg-forest-950/55" />
      <Reveal className="container-x relative max-w-4xl py-28">
        <Quote className="mx-auto text-gold-300" size={36} strokeWidth={1} />
        <p className="mt-8 font-display text-4xl font-medium italic leading-[1.15] sm:text-6xl">
          “The highlands do not hurry — and here, for once, neither do you.”
        </p>
        <p className="eyebrow mt-10 text-white/70">Don Carlos · Bukidnon</p>
      </Reveal>
    </section>
  );
}

function EventsSection({ events }) {
  return (
    <section className="bg-cream-100 py-28 sm:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow text-gold-600">Festivals & events</p>
              <h2 className="mt-4 font-display text-5xl font-medium leading-[1.02] text-forest-900 sm:text-6xl">
                Celebrate <em className="text-forest-600">with us.</em>
              </h2>
              <p className="mt-6 max-w-sm text-forest-900/65">
                Street dances, harvest fairs, sunrise runs and starlit nights — plan your trip around the moments the
                whole town comes alive.
              </p>
              <Link to="/events" className="btn-dark mt-8">
                Full calendar <CalendarDays size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t border-forest-900/10">
            {events.slice(0, 4).map((e, idx) => (
              <Reveal key={e._id} delay={idx * 80}>
                <EventRow event={e} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stays({ businesses }) {
  return (
    <section className="overflow-hidden bg-cream-50 py-28 sm:py-36">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow text-gold-600">Stay & dine</p>
            <h2 className="mt-4 max-w-xl font-display text-5xl font-medium leading-[1.02] text-forest-900 sm:text-6xl">
              Rest well. <em className="text-forest-600">Eat better.</em>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <Link to="/stays" className="link-underline text-sm text-forest-900">
              Browse the directory <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </div>
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]">
        {businesses.slice(0, 6).map((b, idx) => (
          <Reveal key={b._id} delay={idx * 80} className="w-[82vw] shrink-0 snap-start sm:w-[380px]">
            <BusinessCard business={b} />
          </Reveal>
        ))}
        <Reveal className="flex w-[70vw] shrink-0 snap-start sm:w-[300px]">
          <Link
            to="/register?role=business_owner"
            className="group flex w-full flex-col justify-between rounded-[1.75rem] border border-dashed border-forest-900/25 p-8 transition-colors hover:border-forest-900 hover:bg-forest-900 hover:text-cream-50"
          >
            <p className="eyebrow text-gold-600">For local businesses</p>
            <div>
              <p className="font-display text-3xl leading-tight">List your inn, café or tour here.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                Become a partner <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const PLAN = [
  {
    icon: Bus,
    title: 'Getting here',
    text: 'Don Carlos sits along the Sayre Highway in southern Bukidnon — roughly 3–4 hours by road from Cagayan de Oro or Davao City. Buses and vans pass through the town proper daily.',
  },
  {
    icon: CalendarDays,
    title: 'When to visit',
    text: 'The plateau is cool and green all year. Drier months are ideal for ridge hikes and camping; plan around the town fiesta and harvest fairs for the liveliest streets.',
  },
  {
    icon: Backpack,
    title: 'What to bring',
    text: 'A light jacket for chilly mornings, sturdy shoes for trails, a refillable bottle, and cash — smaller stalls and rural spots may not accept cards.',
  },
];

function Plan() {
  return (
    <section id="plan" className="scroll-mt-20 border-t border-forest-900/10 bg-cream-50 py-28 sm:py-36">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-gold-600">Plan your visit</p>
          <h2 className="mt-4 font-display text-5xl font-medium leading-[1.02] text-forest-900 sm:text-6xl">
            Everything you need, <em className="text-forest-600">before you go.</em>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {PLAN.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 120} className="border-t border-forest-900 pt-8">
              <p.icon className="text-gold-600" size={28} strokeWidth={1.25} />
              <h3 className="mt-6 font-display text-3xl text-forest-900">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-forest-900/65">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [state, setState] = useState({ status: 'idle', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const d = await api('/contact', { method: 'POST', body: form });
      setState({ status: 'done', message: d.message });
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 bg-cream-100 py-28 sm:py-36">
      <div className="container-x grid gap-16 lg:grid-cols-2">
        <Reveal>
          <div className="zoom-img relative h-full min-h-[420px] overflow-hidden rounded-[2rem]">
            <img
              src={img('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80&auto=format&fit=crop', 1400)}
              alt="Sunlight through the forest"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-cream-50">
              <p className="eyebrow text-gold-300">Tourism Office</p>
              <p className="mt-3 font-display text-4xl leading-tight">Questions, group tours or permits? We’re happy to help.</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow text-gold-600">Get in touch</p>
          <h2 className="mt-4 font-display text-5xl font-medium leading-[1.02] text-forest-900">Write to us.</h2>
          <form onSubmit={submit} className="mt-10 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-name">Name</label>
              <input id="c-name" className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label" htmlFor="c-email">Email</label>
              <input id="c-email" type="email" className="input" required value={form.email} onChange={set('email')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-subject">Subject</label>
              <input id="c-subject" className="input" value={form.subject} onChange={set('subject')} placeholder="Group tour, event inquiry…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-msg">Message</label>
              <textarea id="c-msg" rows={5} className="input resize-none" required value={form.message} onChange={set('message')} />
            </div>
            <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />
            <div className="sm:col-span-2">
              <Alert type={state.status === 'error' ? 'error' : 'success'} className="mb-4">{state.message}</Alert>
              <button className="btn-dark w-full sm:w-auto" disabled={state.status === 'loading'}>
                {state.status === 'loading' ? <Spinner /> : <Send size={16} />} Send message
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ['Lake Pinamaloy', 'Sea of clouds', 'Hidden falls', 'Harvest fairs', 'Starlit camps', 'Highland coffee', 'Town fiesta'];
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-forest-900/10 bg-cream-50 py-6" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {row.map((w, idx) => (
          <span key={idx} className="flex items-center gap-12 font-display text-3xl italic text-forest-900/70">
            {w} <span className="text-base not-italic text-gold-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const spots = useApi('/tourist-spots?sort=popular&limit=12', { fallback: sampleSpots });
  const events = useApi('/events?upcoming=true&limit=6', { fallback: sampleEvents });
  const businesses = useApi('/businesses', { fallback: sampleBusinesses });
  const stats = useApi('/stats', { fallback: sampleStats });

  // Featured first, then by popularity
  const ordered = [...(spots.data || [])].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  return (
    <>
      <Hero />
      <Intro stats={stats.data || sampleStats} />
      <Featured spots={ordered} />
      <Marquee />
      <Experiences />
      {events.data?.length > 0 && <EventsSection events={events.data} />}
      <QuoteBand />
      {businesses.data?.length > 0 && <Stays businesses={businesses.data} />}
      <Plan />
      <Contact />
    </>
  );
}

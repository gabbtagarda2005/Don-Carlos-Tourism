import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, MapPin, Mail, Phone, ArrowUpRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Spinner } from './ui';

const NAV = [
  { to: '/explore', label: 'Destinations' },
  { to: '/events', label: 'Festivals & Events' },
  { to: '/stays', label: 'Stay & Dine' },
  { to: '/#plan', label: 'Plan Your Visit' },
];

export function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Don Carlos Tourism home">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeOpacity=".35" className={light ? 'text-cream-50' : 'text-forest-900'} />
        <path d="M7 28 L16 15 L21 22 L25 17 L33 28 Z" className={light ? 'fill-cream-50' : 'fill-forest-800'} />
        <circle cx="27" cy="12" r="3" className="fill-gold-400" />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-2xl font-semibold tracking-tight ${light ? 'text-cream-50' : 'text-forest-900'}`}>Don Carlos</span>
        <span className={`mt-1 block whitespace-nowrap text-[9px] font-semibold uppercase tracking-widest2 ${light ? 'text-cream-50/70' : 'text-forest-900/50'}`}>
          Bukidnon · Philippines
        </span>
      </span>
    </Link>
  );
}

function Header() {
  const { pathname } = useLocation();
  const { user, isStaff } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === '/' || pathname.startsWith('/spots/');
  const solid = scrolled || !overHero || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const linkCls = ({ isActive }) =>
    `relative text-[13px] font-semibold tracking-wide transition-colors ${
      solid ? (isActive ? 'text-forest-900' : 'text-forest-900/65 hover:text-forest-900') : isActive ? 'text-white' : 'text-white/75 hover:text-white'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        solid ? 'border-b border-forest-900/10 bg-cream-50/85 py-3 backdrop-blur-xl' : 'bg-transparent py-6'
      }`}
    >
      <div className="container-x flex items-center justify-between gap-6">
        <Logo light={!solid} />
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
          {NAV.map((n) =>
            n.to.includes('#') ? (
              <a key={n.to} href={n.to} className={linkCls({ isActive: false })}>
                {n.label}
              </a>
            ) : (
              <NavLink key={n.to} to={n.to} className={linkCls}>
                {n.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link to={isStaff ? '/admin' : '/account'} className={solid ? 'btn-outline !py-2.5' : 'btn-ghost !py-2.5'}>
              <User size={15} /> {isStaff ? 'Admin console' : user.firstName}
            </Link>
          ) : (
            <>
              <Link to="/login" className={`text-[13px] font-semibold ${solid ? 'text-forest-900/70 hover:text-forest-900' : 'text-white/80 hover:text-white'}`}>
                Sign in
              </Link>
              <Link to="/explore" className="btn-gold !py-2.5">
                Start exploring
              </Link>
            </>
          )}
        </div>
        <button
          className={`rounded-full p-2 lg:hidden ${solid ? 'text-forest-900' : 'text-white'}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="container-x animate-fade pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col divide-y divide-forest-900/10 border-y border-forest-900/10" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="flex items-center justify-between py-4 font-display text-2xl text-forest-900">
                {n.label} <ArrowRight size={18} className="text-gold-600" />
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex gap-3">
            {user ? (
              <Link to={isStaff ? '/admin' : '/account'} className="btn-dark flex-1">
                {isStaff ? 'Admin console' : 'My account'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline flex-1">Sign in</Link>
                <Link to="/register" className="btn-dark flex-1">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const d = await api('/subscribe', { method: 'POST', body: { email } });
      setState({ status: 'done', message: d.message });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };
  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <label htmlFor="nl-email" className="eyebrow text-gold-300">Letters from the highlands</label>
      <p className="mt-3 text-sm leading-relaxed text-cream-100/70">
        Festival dates, new trails and seasonal stories — a few times a year, never spam.
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-full border border-cream-50/20 bg-white/5 p-1.5 focus-within:border-gold-400">
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-cream-50 placeholder:text-cream-50/40 focus:outline-none"
        />
        <button className="btn-gold !px-5 !py-2.5" disabled={state.status === 'loading'} aria-label="Subscribe">
          {state.status === 'loading' ? <Spinner /> : <ArrowRight size={16} />}
        </button>
      </div>
      {state.message && (
        <p className={`mt-3 text-sm ${state.status === 'error' ? 'text-red-300' : 'text-gold-300'}`}>{state.message}</p>
      )}
    </form>
  );
}

function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-forest-950 text-cream-100">
      <div className="container-x relative pb-10 pt-24">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-5xl leading-[1.05] text-cream-50 sm:text-6xl">
              Come for the view.
              <br />
              <em className="text-gold-300">Stay for the stillness.</em>
            </p>
          </div>
          <Newsletter />
        </div>

        <div className="mt-20 grid gap-10 border-t border-cream-50/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-100/60">
              The official tourism information system of the Municipality of Don Carlos, Bukidnon.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-5 text-cream-50/50">Discover</p>
            <ul className="space-y-3 text-sm">
              <li><Link className="hover:text-gold-300" to="/explore">All destinations</Link></li>
              <li><Link className="hover:text-gold-300" to="/explore?category=nature">Nature & lakes</Link></li>
              <li><Link className="hover:text-gold-300" to="/explore?category=adventure">Adventure</Link></li>
              <li><Link className="hover:text-gold-300" to="/events">Festivals & events</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5 text-cream-50/50">For partners</p>
            <ul className="space-y-3 text-sm">
              <li><Link className="hover:text-gold-300" to="/register?role=business_owner">List your business</Link></li>
              <li><Link className="hover:text-gold-300" to="/stays">Stay & dine directory</Link></li>
              <li><Link className="hover:text-gold-300" to="/login">Partner sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5 text-cream-50/50">Tourism Office</p>
            <ul className="space-y-3 text-sm text-cream-100/80">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" /> Municipal Hall, Poblacion, Don Carlos, Bukidnon 8712</li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-gold-400" /> <a href="/#contact" className="hover:text-gold-300">Send us a message</a></li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-gold-400" /> Emergency: 911</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream-50/10 pt-8 text-xs text-cream-100/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Municipality of Don Carlos · Tourism Office</p>
          <a href="#top" className="inline-flex items-center gap-1 hover:text-gold-300">
            Back to top <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [hash, pathname]);

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

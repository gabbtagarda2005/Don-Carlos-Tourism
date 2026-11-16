import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPinned, CalendarDays, Store, Users, MessageSquareText, Inbox, ServerCog, LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/SiteLayout';
import { titleCase } from '../../lib/format';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/spots', label: 'Destinations', icon: MapPinned },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/businesses', label: 'Businesses', icon: Store },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/admin/messages', label: 'Inbox', icon: Inbox },
  { to: '/admin/system', label: 'System & security', icon: ServerCog },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6"><Logo light /></div>
      <p className="eyebrow px-6 pb-3 text-cream-50/40">Tourism console</p>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-cream-50 text-forest-950' : 'text-cream-100/70 hover:bg-cream-50/5 hover:text-cream-50'
              }`
            }
          >
            <n.icon size={18} strokeWidth={1.75} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-cream-50/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/70 hover:bg-cream-50/5 hover:text-cream-50">
          <ExternalLink size={18} strokeWidth={1.75} /> View website
        </Link>
        <div className="flex items-center gap-3 px-3 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400 font-display text-lg text-forest-950">
            {user.firstName[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cream-50">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-cream-100/50">{titleCase(user.role)}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="rounded-lg p-2 text-cream-100/60 hover:bg-cream-50/10 hover:text-cream-50"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-cream-100/60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-forest-950 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-forest-950 px-5 py-3 lg:hidden">
        <Logo light />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-cream-50" aria-label="Open menu"><Menu size={22} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-forest-950/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 bg-forest-950 animate-fade">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-lg p-2 text-cream-50" aria-label="Close menu"><X size={20} /></button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

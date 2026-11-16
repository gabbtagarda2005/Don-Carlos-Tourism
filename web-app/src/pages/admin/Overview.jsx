import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, MapPinned, Store, CalendarDays, Eye, MessageSquareText, Inbox, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../lib/api';
import { timeAgo, titleCase } from '../../lib/format';
import { Alert, PageLoader, Stars } from '../../components/ui';
import { AdminHeader } from './shared';

const C = { forest: '#355d47', gold: '#c69d4f', grid: 'rgba(21,42,32,.08)', axis: 'rgba(21,42,32,.5)' };

function Stat({ icon: Icon, label, value, to, accent }) {
  const body = (
    <div className="card h-full p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-forest-900/50">{label}</p>
        <Icon size={18} className={accent ? 'text-gold-600' : 'text-forest-500'} strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-display text-4xl text-forest-900">{Number(value || 0).toLocaleString()}</p>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

const tooltipStyle = { borderRadius: 12, border: '1px solid rgba(21,42,32,.1)', fontSize: 12 };

export default function Overview() {
  const { data, loading, error } = useApi('/admin/stats');
  if (loading && !data) return <PageLoader />;
  if (error) return <Alert>{error.message}</Alert>;
  const t = data.totals;

  return (
    <>
      <AdminHeader title="Overview" subtitle="A snapshot of tourism activity in Don Carlos." />

      {(t.pendingBusinesses > 0 || t.unreadMessages > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {t.pendingBusinesses > 0 && (
            <Link to="/admin/businesses" className="flex items-center justify-between rounded-2xl border border-gold-300 bg-gold-300/20 px-5 py-4 text-sm text-forest-900 hover:bg-gold-300/30">
              <span className="flex items-center gap-3"><Clock size={18} className="text-gold-700" /> <b>{t.pendingBusinesses}</b> business{t.pendingBusinesses > 1 ? 'es' : ''} awaiting approval</span>
              <ArrowRight size={16} />
            </Link>
          )}
          {t.unreadMessages > 0 && (
            <Link to="/admin/messages" className="flex items-center justify-between rounded-2xl border border-forest-200 bg-forest-50 px-5 py-4 text-sm text-forest-900 hover:bg-forest-100">
              <span className="flex items-center gap-3"><Inbox size={18} className="text-forest-600" /> <b>{t.unreadMessages}</b> unread message{t.unreadMessages > 1 ? 's' : ''}</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Eye} label="Page visits" value={t.visits} accent />
        <Stat icon={MapPinned} label="Destinations" value={t.spots} to="/admin/spots" />
        <Stat icon={Store} label="Businesses" value={t.businesses} to="/admin/businesses" />
        <Stat icon={CalendarDays} label="Upcoming events" value={t.upcomingEvents} to="/admin/events" />
        <Stat icon={Users} label="Users" value={t.users} to="/admin/users" />
        <Stat icon={MessageSquareText} label="Reviews" value={t.reviews} to="/admin/reviews" />
        <Stat icon={Inbox} label="Subscribers" value={t.subscribers} to="/admin/messages" />
        <Stat icon={Clock} label="Pending approvals" value={t.pendingBusinesses} to="/admin/businesses" accent />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <p className="font-display text-2xl text-forest-900">Growth · last 6 months</p>
          <p className="text-xs text-forest-900/50">New registrations and reviews per month</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growth} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.forest} stopOpacity={0.3} /><stop offset="100%" stopColor={C.forest} stopOpacity={0} /></linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.3} /><stop offset="100%" stopColor={C.gold} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: C.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="users" name="New users" stroke={C.forest} strokeWidth={2} fill="url(#gU)" />
                <Area type="monotone" dataKey="reviews" name="Reviews" stroke={C.gold} strokeWidth={2} fill="url(#gR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-5 text-xs text-forest-900/60">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: C.forest }} /> New users</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: C.gold }} /> Reviews</span>
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <p className="font-display text-2xl text-forest-900">Visits by category</p>
          <p className="text-xs text-forest-900/50">Total destination page views</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCategory.map((c) => ({ ...c, label: titleCase(c.category || 'other') }))} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" width={80} tick={{ fill: C.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(21,42,32,.04)' }} />
                <Bar dataKey="visits" name="Visits" fill={C.forest} radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="font-display text-2xl text-forest-900">Most visited destinations</p>
          <ol className="mt-4 divide-y divide-forest-900/5">
            {data.topSpots.map((s, i) => (
              <li key={s._id} className="flex items-center gap-4 py-3">
                <span className="w-6 font-display text-2xl text-forest-900/30">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link to={`/spots/${s.slug}`} target="_blank" className="truncate font-semibold text-forest-900 hover:underline">{s.name}</Link>
                  <p className="flex items-center gap-2 text-xs text-forest-900/50"><Stars value={s.rating} size={11} className="text-forest-900" /> {s.reviewCount} reviews</p>
                </div>
                <span className="text-sm font-semibold text-forest-900">{s.visitCount.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-6">
          <p className="font-display text-2xl text-forest-900">Recent activity</p>
          <ul className="mt-4 divide-y divide-forest-900/5">
            {data.recentActivity.length === 0 && <li className="py-3 text-sm text-forest-900/50">No activity recorded yet.</li>}
            {data.recentActivity.map((a) => (
              <li key={a._id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-forest-900">{titleCase(a.action)}</p>
                  <p className="truncate text-xs text-forest-900/50">
                    {a.user ? `${a.user.firstName} ${a.user.lastName}` : a.email || 'System'}
                    {a.details ? ` · ${a.details}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-forest-900/40">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

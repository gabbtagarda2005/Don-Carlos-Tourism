import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Store, UserRound, LogOut, Plus, Pencil, Trash2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, useApi } from '../../lib/api';
import { businessLabel, titleCase } from '../../lib/format';
import { SpotCard } from '../../components/Cards';
import { BusinessForm } from '../../components/Forms';
import { Alert, EmptyState, Modal, PageLoader, Spinner } from '../../components/ui';

const STATUS_STYLE = {
  approved: 'bg-forest-100 text-forest-800',
  pending: 'bg-gold-300/40 text-gold-700',
  rejected: 'bg-red-100 text-red-700',
};

function Favorites() {
  const { data, loading } = useApi('/users/me/favorites');
  if (loading) return <PageLoader />;
  if (!data?.length) {
    return (
      <EmptyState icon={Heart} title="No saved places yet">
        Tap “Save” on any destination to keep it here. <Link to="/explore" className="font-semibold text-forest-900 underline">Explore now</Link>
      </EmptyState>
    );
  }
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((s) => <SpotCard key={s._id} spot={s} />)}</div>;
}

function MyBusinesses() {
  const { data, loading, reload } = useApi('/businesses/mine');
  const [editing, setEditing] = useState(null); // null | 'new' | business

  const remove = async (b) => {
    if (!window.confirm(`Delete “${b.name}”? This cannot be undone.`)) return;
    await api(`/businesses/${b._id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-forest-900/60">New listings are reviewed by the Tourism Office before they appear publicly.</p>
        <button className="btn-dark !py-2.5" onClick={() => setEditing('new')}><Plus size={16} /> New listing</button>
      </div>
      {loading ? (
        <PageLoader />
      ) : !data?.length ? (
        <EmptyState icon={Store} title="List your first business">Inns, restaurants, tours and shops are all welcome.</EmptyState>
      ) : (
        <div className="space-y-3">
          {data.map((b) => (
            <div key={b._id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <img src={b.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=60&auto=format&fit=crop'} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl text-forest-900">{b.name}</p>
                <p className="text-sm text-forest-900/60">{businessLabel(b.category)}</p>
              </div>
              <span className={`chip ${STATUS_STYLE[b.status]}`}>{b.status}</span>
              <div className="flex gap-2">
                <button onClick={() => setEditing(b)} className="rounded-full p-2 hover:bg-forest-900/5" aria-label="Edit"><Pencil size={16} /></button>
                <button onClick={() => remove(b)} className="rounded-full p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} wide title={editing === 'new' ? 'New business listing' : 'Edit listing'} onClose={() => setEditing(null)}>
        {editing && (
          <BusinessForm
            business={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ profile: null, password: null });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try {
      const d = await api('/auth/me', { method: 'PUT', body: p });
      setUser(d.user);
      setMsg((m) => ({ ...m, profile: { type: 'success', text: 'Profile updated.' } }));
    } catch (err) {
      setMsg((m) => ({ ...m, profile: { type: 'error', text: err.message } }));
    }
    setBusy('');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setBusy('password');
    try {
      await api('/auth/password', { method: 'PUT', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      setMsg((m) => ({ ...m, password: { type: 'success', text: 'Password changed.' } }));
    } catch (err) {
      setMsg((m) => ({ ...m, password: { type: 'error', text: err.message } }));
    }
    setBusy('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <p className="font-display text-2xl text-forest-900">Profile</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First name</label><input className="input" required value={p.firstName} onChange={(e) => setP({ ...p, firstName: e.target.value })} /></div>
          <div><label className="label">Last name</label><input className="input" required value={p.lastName} onChange={(e) => setP({ ...p, lastName: e.target.value })} /></div>
        </div>
        <div><label className="label">Email</label><input className="input bg-forest-900/5" value={user.email} disabled /></div>
        <div><label className="label">Phone</label><input className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div>
        {msg.profile && <Alert type={msg.profile.type}>{msg.profile.text}</Alert>}
        <button className="btn-dark" disabled={busy === 'profile'}>{busy === 'profile' && <Spinner />} Save profile</button>
      </form>
      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <p className="font-display text-2xl text-forest-900">Change password</p>
        <div><label className="label">Current password</label><input type="password" className="input" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></div>
        <div><label className="label">New password</label><input type="password" minLength={8} className="input" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></div>
        {msg.password && <Alert type={msg.password.type}>{msg.password.text}</Alert>}
        <button className="btn-dark" disabled={busy === 'password'}>{busy === 'password' && <Spinner />} Update password</button>
      </form>
    </div>
  );
}

export default function Account() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const isOwner = user.role === 'business_owner' || isStaff;
  const tabs = [
    { id: 'saved', label: 'Saved places', icon: Heart },
    ...(isOwner ? [{ id: 'business', label: 'My businesses', icon: Store }] : []),
    { id: 'profile', label: 'Profile', icon: UserRound },
  ];
  const [tab, setTab] = useState(user.role === 'business_owner' ? 'business' : 'saved');

  return (
    <>
      <section className="grain relative overflow-hidden bg-forest-950 pb-16 pt-36 text-cream-50">
        <div className="container-x relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-gold-300">{titleCase(user.role)} account</p>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl">Hello, {user.firstName}.</h1>
          </div>
          <div className="flex gap-3">
            {isStaff && <Link to="/admin" className="btn-gold !py-2.5"><LayoutDashboard size={16} /> Admin console</Link>}
            <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost !py-2.5"><LogOut size={16} /> Sign out</button>
          </div>
        </div>
      </section>
      <section className="container-x py-12">
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto border-b border-forest-900/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === t.id ? 'border-forest-900 text-forest-900' : 'border-transparent text-forest-900/50 hover:text-forest-900'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        {tab === 'saved' && <Favorites />}
        {tab === 'business' && <MyBusinesses />}
        {tab === 'profile' && <Profile />}
      </section>
    </>
  );
}

import { useState } from 'react';
import { Trash2, Ban, CircleCheck } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { ROLES, formatDate, timeAgo, titleCase } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui';
import { AdminHeader, IconButton, SearchBox, Table, Tabs } from './shared';

export default function Users() {
  const { user: me } = useAuth();
  const { data, loading, error, reload, setData } = useApi('/users');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [actionError, setActionError] = useState('');
  const all = data || [];
  const rows = all.filter(
    (u) => (role === 'all' || u.role === role) && (!q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
  );

  const update = async (u, body) => {
    setActionError('');
    try {
      const d = await api(`/users/${u._id}`, { method: 'PATCH', body });
      setData(all.map((x) => (x._id === u._id ? d.data : x)));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Permanently delete ${u.email}?`)) return;
    setActionError('');
    try {
      await api(`/users/${u._id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const roleOptions = me.role === 'developer' ? ROLES : ROLES.filter((r) => r !== 'developer');

  return (
    <>
      <AdminHeader title="Users" subtitle="Manage accounts, roles and access" actions={<SearchBox value={q} onChange={setQ} placeholder="Search name or email" />} />
      <div className="mb-4">
        <Tabs
          value={role}
          onChange={setRole}
          options={[{ value: 'all', label: 'All', count: all.length }, ...ROLES.map((r) => ({ value: r, label: titleCase(r), count: all.filter((u) => u.role === r).length }))]}
        />
      </div>
      <Alert className="mb-4">{actionError}</Alert>
      <Table
        loading={loading}
        error={error}
        rows={rows}
        columns={[
          {
            key: 'name',
            label: 'User',
            render: (u) => (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-cream-50">{u.firstName[0]}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-forest-900">{u.firstName} {u.lastName} {u._id === me._id && <span className="text-xs font-normal text-forest-900/40">(you)</span>}</p>
                  <p className="truncate text-xs text-forest-900/50">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            label: 'Role',
            render: (u) => (
              <select
                className="rounded-lg border border-forest-900/15 bg-white px-2 py-1.5 text-xs disabled:opacity-60"
                value={u.role}
                disabled={u._id === me._id || (u.role === 'developer' && me.role !== 'developer')}
                onChange={(e) => update(u, { role: e.target.value })}
                aria-label={`Role for ${u.email}`}
              >
                {(u.role === 'developer' && me.role !== 'developer' ? ROLES : roleOptions).map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
              </select>
            ),
          },
          { key: 'createdAt', label: 'Joined', render: (u) => formatDate(u.createdAt, { month: 'short', day: 'numeric', year: 'numeric' }) },
          { key: 'lastLogin', label: 'Last sign in', render: (u) => (u.lastLogin ? timeAgo(u.lastLogin) : '—') },
          {
            key: 'isActive',
            label: 'Status',
            render: (u) => <span className={`chip ${u.isActive ? 'bg-forest-100 text-forest-800' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Disabled'}</span>,
          },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (u) =>
              u._id === me._id ? null : (
                <div className="flex justify-end gap-1">
                  {u.isActive ? (
                    <IconButton icon={Ban} label="Disable account" onClick={() => update(u, { isActive: false })} />
                  ) : (
                    <IconButton icon={CircleCheck} label="Enable account" onClick={() => update(u, { isActive: true })} />
                  )}
                  <IconButton icon={Trash2} label="Delete" danger onClick={() => remove(u)} />
                </div>
              ),
          },
        ]}
      />
    </>
  );
}

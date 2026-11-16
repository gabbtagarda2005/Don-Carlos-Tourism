import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, RotateCcw } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { businessLabel, formatDate, img } from '../../lib/format';
import { Modal } from '../../components/ui';
import { BusinessForm } from '../../components/Forms';
import { AdminHeader, IconButton, SearchBox, Table, Tabs } from './shared';

const STATUS_STYLE = {
  approved: 'bg-forest-100 text-forest-800',
  pending: 'bg-gold-300/40 text-gold-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Businesses() {
  const { data, loading, error, reload } = useApi('/businesses?all=1');
  const all = data || [];
  const [status, setStatus] = useState(() => 'pending');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);

  const counts = all.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {});
  const rows = all.filter(
    (b) => (status === 'all' || b.status === status) && (!q || `${b.name} ${b.category} ${b.owner?.email}`.toLowerCase().includes(q.toLowerCase()))
  );

  const setBizStatus = async (b, s) => {
    setBusy(b._id);
    try {
      await api(`/businesses/${b._id}/status`, { method: 'PATCH', body: { status: s } });
      await reload();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete “${b.name}”?`)) return;
    await api(`/businesses/${b._id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <AdminHeader
        title="Businesses"
        subtitle="Review partner applications and manage the stay & dine directory"
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Search businesses" />
            <button className="btn-dark !py-2.5" onClick={() => setEditing('new')}><Plus size={16} /> Add business</button>
          </>
        }
      />
      <div className="mb-4">
        <Tabs
          value={status}
          onChange={setStatus}
          options={[
            { value: 'pending', label: 'Pending', count: counts.pending || 0 },
            { value: 'approved', label: 'Approved', count: counts.approved || 0 },
            { value: 'rejected', label: 'Rejected', count: counts.rejected || 0 },
            { value: 'all', label: 'All', count: all.length },
          ]}
        />
      </div>
      <Table
        loading={loading}
        error={error}
        rows={rows}
        empty={status === 'pending' ? 'No applications waiting — all caught up.' : 'No businesses here.'}
        columns={[
          {
            key: 'name',
            label: 'Business',
            render: (b) => (
              <div className="flex items-center gap-3">
                <img src={img(b.images?.[0], 160)} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold text-forest-900">{b.name}</p>
                  <p className="truncate text-xs text-forest-900/50">{b.contact?.address}</p>
                </div>
              </div>
            ),
          },
          { key: 'category', label: 'Category', render: (b) => businessLabel(b.category) },
          {
            key: 'owner',
            label: 'Owner',
            render: (b) => (b.owner ? <span className="text-xs">{b.owner.firstName} {b.owner.lastName}<br /><span className="text-forest-900/50">{b.owner.email}</span></span> : '—'),
          },
          { key: 'createdAt', label: 'Submitted', render: (b) => formatDate(b.createdAt, { month: 'short', day: 'numeric', year: 'numeric' }) },
          { key: 'status', label: 'Status', render: (b) => <span className={`chip ${STATUS_STYLE[b.status]}`}>{b.status}</span> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (b) => (
              <div className="flex justify-end gap-1">
                {b.status !== 'approved' && <IconButton icon={Check} label="Approve" disabled={busy === b._id} onClick={() => setBizStatus(b, 'approved')} />}
                {b.status === 'pending' && <IconButton icon={X} label="Reject" danger disabled={busy === b._id} onClick={() => setBizStatus(b, 'rejected')} />}
                {b.status === 'approved' && <IconButton icon={RotateCcw} label="Move back to pending" disabled={busy === b._id} onClick={() => setBizStatus(b, 'pending')} />}
                <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(b)} />
                <IconButton icon={Trash2} label="Delete" danger onClick={() => remove(b)} />
              </div>
            ),
          },
        ]}
      />
      <Modal open={!!editing} wide title={editing === 'new' ? 'New business' : 'Edit business'} onClose={() => setEditing(null)}>
        {editing && (
          <BusinessForm business={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
        )}
      </Modal>
    </>
  );
}

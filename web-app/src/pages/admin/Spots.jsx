import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, ExternalLink } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { img, titleCase } from '../../lib/format';
import { Modal } from '../../components/ui';
import { SpotForm } from '../../components/Forms';
import { AdminHeader, IconButton, SearchBox, StatusPill, Table } from './shared';

export default function Spots() {
  const { data, loading, error, reload } = useApi('/tourist-spots?all=1&sort=name');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const rows = (data || []).filter((s) => !q || `${s.name} ${s.category} ${s.location?.address}`.toLowerCase().includes(q.toLowerCase()));

  const remove = async (s) => {
    if (!window.confirm(`Delete “${s.name}” and all its reviews? This cannot be undone.`)) return;
    await api(`/tourist-spots/${s._id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <AdminHeader
        title="Destinations"
        subtitle={`${data?.length ?? '…'} tourist spots`}
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Search destinations" />
            <button className="btn-dark !py-2.5" onClick={() => setEditing('new')}><Plus size={16} /> Add destination</button>
          </>
        }
      />
      <Table
        loading={loading}
        error={error}
        rows={rows}
        columns={[
          {
            key: 'name',
            label: 'Destination',
            render: (s) => (
              <div className="flex items-center gap-3">
                <img src={img(s.images?.[0], 160)} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-forest-900">
                    {s.name} {s.featured && <Star size={13} className="fill-gold-400 text-gold-400" aria-label="Featured" />}
                  </p>
                  <p className="truncate text-xs text-forest-900/50">{s.location?.address}</p>
                </div>
              </div>
            ),
          },
          { key: 'category', label: 'Category', render: (s) => titleCase(s.category) },
          { key: 'rating', label: 'Rating', render: (s) => `${Number(s.rating).toFixed(1)} (${s.reviewCount || 0})` },
          { key: 'visitCount', label: 'Visits', render: (s) => s.visitCount.toLocaleString() },
          { key: 'isActive', label: 'Status', render: (s) => <StatusPill on={s.isActive} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (s) => (
              <div className="flex justify-end gap-1">
                <Link to={`/spots/${s.slug}`} target="_blank" className="rounded-lg p-2 text-forest-900/70 hover:bg-forest-900/5" title="View"><ExternalLink size={16} /></Link>
                <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(s)} />
                <IconButton icon={Trash2} label="Delete" danger onClick={() => remove(s)} />
              </div>
            ),
          },
        ]}
      />
      <Modal open={!!editing} wide title={editing === 'new' ? 'New destination' : `Edit ${editing?.name || ''}`} onClose={() => setEditing(null)}>
        {editing && (
          <SpotForm
            spot={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        )}
      </Modal>
    </>
  );
}

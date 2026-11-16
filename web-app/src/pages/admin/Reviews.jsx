import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { timeAgo } from '../../lib/format';
import { Stars } from '../../components/ui';
import { AdminHeader, IconButton, SearchBox, Table, Tabs } from './shared';

export default function Reviews() {
  const { data, loading, error, reload } = useApi('/reviews');
  const [q, setQ] = useState('');
  const [rating, setRating] = useState('all');
  const all = data || [];
  const rows = all.filter(
    (r) =>
      (rating === 'all' || (rating === 'low' ? r.rating <= 2 : r.rating >= 4)) &&
      (!q || `${r.comment} ${r.spot?.name} ${r.user?.email}`.toLowerCase().includes(q.toLowerCase()))
  );

  const remove = async (r) => {
    if (!window.confirm('Delete this review? The destination rating will be recalculated.')) return;
    await api(`/reviews/${r._id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <AdminHeader title="Reviews" subtitle="Moderate visitor feedback" actions={<SearchBox value={q} onChange={setQ} placeholder="Search reviews" />} />
      <div className="mb-4">
        <Tabs
          value={rating}
          onChange={setRating}
          options={[
            { value: 'all', label: 'All', count: all.length },
            { value: 'high', label: '4–5 stars', count: all.filter((r) => r.rating >= 4).length },
            { value: 'low', label: '1–2 stars', count: all.filter((r) => r.rating <= 2).length },
          ]}
        />
      </div>
      <Table
        loading={loading}
        error={error}
        rows={rows}
        empty="No reviews yet."
        columns={[
          { key: 'rating', label: 'Rating', render: (r) => <Stars value={r.rating} className="text-forest-900" /> },
          { key: 'comment', label: 'Review', className: 'max-w-md', render: (r) => <p className="line-clamp-2 text-forest-900/80">{r.comment || <i className="text-forest-900/40">No comment</i>}</p> },
          { key: 'spot', label: 'Destination', render: (r) => (r.spot ? <Link to={`/spots/${r.spot.slug}`} target="_blank" className="font-semibold hover:underline">{r.spot.name}</Link> : '—') },
          { key: 'user', label: 'By', render: (r) => (r.user ? <span className="text-xs">{r.user.firstName} {r.user.lastName}<br /><span className="text-forest-900/50">{r.user.email}</span></span> : '—') },
          { key: 'createdAt', label: 'When', render: (r) => <span className="text-xs text-forest-900/60">{timeAgo(r.updatedAt || r.createdAt)}</span> },
          { key: 'actions', label: '', className: 'text-right', render: (r) => <IconButton icon={Trash2} label="Delete review" danger onClick={() => remove(r)} /> },
        ]}
      />
    </>
  );
}

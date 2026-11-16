import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { formatDateRange, img } from '../../lib/format';
import { Modal } from '../../components/ui';
import { EventForm } from '../../components/Forms';
import { AdminHeader, IconButton, StatusPill, Table, Tabs } from './shared';

export default function Events() {
  const { data, loading, error, reload } = useApi('/events?all=1');
  const [filter, setFilter] = useState('upcoming');
  const [editing, setEditing] = useState(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = (e) => new Date(e.endDate || e.date) >= today;
  const all = data || [];
  const rows = all
    .filter((e) => filter === 'all' || (filter === 'upcoming' ? isUpcoming(e) : !isUpcoming(e)))
    .sort((a, b) => (filter === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)));

  const remove = async (e) => {
    if (!window.confirm(`Delete “${e.title}”?`)) return;
    await api(`/events/${e._id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <AdminHeader
        title="Events"
        subtitle="Festivals, announcements and community gatherings"
        actions={<button className="btn-dark !py-2.5" onClick={() => setEditing('new')}><Plus size={16} /> Add event</button>}
      />
      <div className="mb-4">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'upcoming', label: 'Upcoming', count: all.filter(isUpcoming).length },
            { value: 'past', label: 'Past', count: all.filter((e) => !isUpcoming(e)).length },
            { value: 'all', label: 'All', count: all.length },
          ]}
        />
      </div>
      <Table
        loading={loading}
        error={error}
        rows={rows}
        empty="No events in this view."
        columns={[
          {
            key: 'title',
            label: 'Event',
            render: (e) => (
              <div className="flex items-center gap-3">
                <img src={img(e.images?.[0], 160)} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold text-forest-900">{e.title}</p>
                  <p className="text-xs text-forest-900/50">{e.location}</p>
                </div>
              </div>
            ),
          },
          { key: 'date', label: 'Date', render: (e) => formatDateRange(e.date, e.endDate) },
          { key: 'category', label: 'Category' },
          { key: 'isActive', label: 'Status', render: (e) => <StatusPill on={e.isActive} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (e) => (
              <div className="flex justify-end gap-1">
                <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(e)} />
                <IconButton icon={Trash2} label="Delete" danger onClick={() => remove(e)} />
              </div>
            ),
          },
        ]}
      />
      <Modal open={!!editing} wide title={editing === 'new' ? 'New event' : 'Edit event'} onClose={() => setEditing(null)}>
        {editing && (
          <EventForm event={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
        )}
      </Modal>
    </>
  );
}

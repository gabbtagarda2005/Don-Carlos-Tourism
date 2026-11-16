import { useState } from 'react';
import { Mail, MailOpen, Trash2, Reply, Copy, Inbox } from 'lucide-react';
import { api, useApi } from '../../lib/api';
import { formatDateTime, timeAgo } from '../../lib/format';
import { EmptyState, PageLoader, Alert } from '../../components/ui';
import { AdminHeader, IconButton, Table, Tabs } from './shared';

function MessageList() {
  const { data, loading, error, setData } = useApi('/admin/messages');
  const [openId, setOpenId] = useState(null);
  const all = data || [];

  const markRead = async (m, isRead) => {
    const d = await api(`/admin/messages/${m._id}`, { method: 'PATCH', body: { isRead } });
    setData(all.map((x) => (x._id === m._id ? d.data : x)));
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    await api(`/admin/messages/${m._id}`, { method: 'DELETE' });
    setData(all.filter((x) => x._id !== m._id));
  };

  const toggle = (m) => {
    setOpenId(openId === m._id ? null : m._id);
    if (!m.isRead) markRead(m, true);
  };

  if (loading && !data) return <PageLoader />;
  if (error) return <Alert>{error.message}</Alert>;
  if (!all.length) return <EmptyState icon={Inbox} title="Inbox zero">Messages sent from the website’s contact form appear here.</EmptyState>;

  return (
    <div className="card divide-y divide-forest-900/5">
      {all.map((m) => (
        <div key={m._id} className={m.isRead ? '' : 'bg-gold-300/10'}>
          <button onClick={() => toggle(m)} className="flex w-full items-start gap-4 px-5 py-4 text-left">
            {m.isRead ? <MailOpen size={18} className="mt-0.5 shrink-0 text-forest-900/30" /> : <Mail size={18} className="mt-0.5 shrink-0 text-gold-600" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <p className={`truncate text-sm ${m.isRead ? 'text-forest-900/70' : 'font-semibold text-forest-900'}`}>{m.name} <span className="font-normal text-forest-900/45">· {m.email}</span></p>
                <span className="shrink-0 text-xs text-forest-900/40">{timeAgo(m.createdAt)}</span>
              </div>
              <p className="truncate text-sm text-forest-900/60">{m.subject || '(no subject)'} — {m.message}</p>
            </div>
          </button>
          {openId === m._id && (
            <div className="px-5 pb-5 pl-14">
              <p className="text-xs text-forest-900/40">{formatDateTime(m.createdAt)}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-forest-900">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message to Don Carlos Tourism'}`)}`} className="btn-dark !px-4 !py-2 text-xs"><Reply size={14} /> Reply</a>
                <button className="btn-outline !px-4 !py-2 text-xs" onClick={() => markRead(m, false)}>Mark unread</button>
                <button className="btn !px-4 !py-2 text-xs text-red-600 hover:bg-red-50" onClick={() => remove(m)}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Subscribers() {
  const { data, loading, error, setData } = useApi('/admin/subscribers');
  const [copied, setCopied] = useState(false);
  const all = data || [];
  const copy = async () => {
    await navigator.clipboard.writeText(all.map((s) => s.email).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email}?`)) return;
    await api(`/admin/subscribers/${s._id}`, { method: 'DELETE' });
    setData(all.filter((x) => x._id !== s._id));
  };
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-outline !py-2" onClick={copy} disabled={!all.length}><Copy size={14} /> {copied ? 'Copied!' : 'Copy all emails'}</button>
      </div>
      <Table
        loading={loading}
        error={error}
        rows={all}
        empty="No subscribers yet."
        columns={[
          { key: 'email', label: 'Email' },
          { key: 'createdAt', label: 'Subscribed', render: (s) => formatDateTime(s.createdAt) },
          { key: 'a', label: '', className: 'text-right', render: (s) => <IconButton icon={Trash2} label="Remove" danger onClick={() => remove(s)} /> },
        ]}
      />
    </>
  );
}

export default function Messages() {
  const [tab, setTab] = useState('messages');
  return (
    <>
      <AdminHeader title="Inbox" subtitle="Contact form messages and newsletter subscribers" />
      <div className="mb-6">
        <Tabs value={tab} onChange={setTab} options={[{ value: 'messages', label: 'Messages' }, { value: 'subscribers', label: 'Subscribers' }]} />
      </div>
      {tab === 'messages' ? <MessageList /> : <Subscribers />}
    </>
  );
}

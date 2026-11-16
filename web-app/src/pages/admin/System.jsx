import { useState } from 'react';
import { Activity, Database, Download, RefreshCw, Server, ShieldCheck, Cpu } from 'lucide-react';
import { api, useApi, API_URL } from '../../lib/api';
import { formatDateTime, titleCase } from '../../lib/format';
import { Alert, Spinner } from '../../components/ui';
import { AdminHeader, Table, Tabs } from './shared';

const uptime = (s) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(' ');
};

const LEVEL = {
  info: 'bg-forest-100 text-forest-800',
  warning: 'bg-gold-300/40 text-gold-700',
  error: 'bg-red-100 text-red-700',
};

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-900/50"><Icon size={15} /> {label}</div>
      <p className="mt-3 font-display text-3xl text-forest-900">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-forest-900/50">{sub}</p>}
    </div>
  );
}

export default function System() {
  const sys = useApi('/admin/system');
  const [type, setType] = useState('auth');
  const logs = useApi(`/admin/logs?type=${type}&limit=300`);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const s = sys.data;

  const exportData = async () => {
    setExporting(true);
    setExportError('');
    try {
      const res = await api('/admin/export', { raw: true, timeout: 60000 });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `don-carlos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message);
    }
    setExporting(false);
  };

  return (
    <>
      <AdminHeader
        title="System & security"
        subtitle="Server health, database and audit logs"
        actions={
          <>
            <button className="btn-outline !py-2.5" onClick={() => { sys.reload(); logs.reload(); }}><RefreshCw size={15} /> Refresh</button>
            <button className="btn-dark !py-2.5" onClick={exportData} disabled={exporting}>{exporting ? <Spinner /> : <Download size={15} />} Export backup</button>
          </>
        }
      />
      <Alert className="mb-4">{exportError || sys.error?.message}</Alert>

      {s && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric icon={Activity} label="Status" value={<span className="flex items-center gap-2"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-forest-500" /> {titleCase(s.status)}</span>} sub={`${s.environment} · ${s.nodeVersion}`} />
            <Metric icon={Server} label="Uptime" value={uptime(s.uptimeSeconds)} sub={`Server time ${formatDateTime(s.serverTime)}`} />
            <Metric icon={Cpu} label="Memory" value={`${s.memory.heapUsedMB} MB`} sub={`RSS ${s.memory.rssMB} MB`} />
            <Metric icon={Database} label="DB latency" value={`${s.database.latencyMs} ms`} sub={`${s.database.name} @ ${s.database.host}`} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-1">
              <p className="font-display text-2xl text-forest-900">Collections</p>
              <p className="text-xs text-forest-900/50">Data {s.database.dataSizeKB.toLocaleString()} KB · Storage {s.database.storageSizeKB.toLocaleString()} KB</p>
              <ul className="mt-4 divide-y divide-forest-900/5 text-sm">
                {s.database.collections.map((c) => (
                  <li key={c.name} className="flex justify-between py-2.5"><span className="font-mono text-xs text-forest-900/70">{c.name}</span><span className="font-semibold">{c.count.toLocaleString()}</span></li>
                ))}
              </ul>
            </div>
            <div className="card p-6 lg:col-span-2">
              <p className="flex items-center gap-2 font-display text-2xl text-forest-900"><ShieldCheck size={20} className="text-forest-600" /> Security checklist</p>
              <ul className="mt-4 space-y-3 text-sm text-forest-900/75">
                <li>• Passwords are hashed with bcrypt (12 rounds) and never returned by the API.</li>
                <li>• JSON Web Tokens expire automatically; disabled accounts are locked out immediately.</li>
                <li>• Sign-in, registration and form endpoints are rate-limited against brute-force and spam.</li>
                <li>• Security headers are applied via Helmet; CORS is restricted to configured origins.</li>
                <li>• Audit logs below are retained for 90 days.</li>
                <li className="pt-2 text-xs text-forest-900/50">API endpoint: <span className="font-mono">{API_URL}</span></li>
              </ul>
            </div>
          </div>
        </>
      )}
      {!s && sys.loading && <div className="flex justify-center py-16"><Spinner /></div>}

      <div className="mb-4 mt-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-display text-3xl text-forest-900">Audit log</p>
        <Tabs value={type} onChange={setType} options={[{ value: 'auth', label: 'Authentication' }, { value: 'admin', label: 'Admin actions' }, { value: 'all', label: 'All' }]} />
      </div>
      <Table
        loading={logs.loading}
        error={logs.error}
        rows={logs.data}
        empty="No log entries yet."
        columns={[
          { key: 'createdAt', label: 'Time', render: (l) => <span className="whitespace-nowrap text-xs">{formatDateTime(l.createdAt)}</span> },
          { key: 'action', label: 'Event', render: (l) => <span className="font-medium">{titleCase(l.action)}</span> },
          { key: 'level', label: 'Level', render: (l) => <span className={`chip ${LEVEL[l.level]}`}>{l.level}</span> },
          { key: 'user', label: 'Account', render: (l) => <span className="text-xs">{l.user ? `${l.user.firstName} ${l.user.lastName}` : l.email || '—'}</span> },
          { key: 'details', label: 'Details', render: (l) => <span className="text-xs text-forest-900/60">{l.details || '—'}</span> },
          { key: 'ip', label: 'IP', render: (l) => <span className="font-mono text-xs text-forest-900/50">{l.ip || '—'}</span> },
        ]}
      />
    </>
  );
}

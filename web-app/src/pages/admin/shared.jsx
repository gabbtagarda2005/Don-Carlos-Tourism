import { Search } from 'lucide-react';
import { Alert, Spinner } from '../../components/ui';

export function AdminHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-4xl font-medium text-forest-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-forest-900/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-900/40" />
      <input className="input !py-2.5 pl-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Tabs({ value, onChange, options }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-forest-900/5 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            value === o.value ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-900/55 hover:text-forest-900'
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-forest-900/40">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * columns: [{ key, label, render?(row), className? }]
 */
export function Table({ columns, rows, loading, error, empty = 'Nothing to show yet.', rowKey = (r) => r._id }) {
  return (
    <div className="card overflow-hidden">
      <Alert className="m-4">{error?.message}</Alert>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 bg-cream-100/60">
              {columns.map((c) => (
                <th key={c.key} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-forest-900/55 ${c.className || ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {loading && !rows?.length ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-forest-900/50"><Spinner className="mx-auto" /></td></tr>
            ) : !rows?.length ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-forest-900/50">{empty}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={rowKey(r)} className="transition-colors hover:bg-cream-100/50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-5 py-3.5 align-middle ${c.className || ''}`}>
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IconButton({ icon: Icon, label, onClick, danger = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition disabled:opacity-40 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-forest-900/70 hover:bg-forest-900/5 hover:text-forest-900'}`}
    >
      <Icon size={16} />
    </button>
  );
}

export function StatusPill({ on, onLabel = 'Published', offLabel = 'Hidden' }) {
  return <span className={`chip ${on ? 'bg-forest-100 text-forest-800' : 'bg-forest-900/5 text-forest-900/50'}`}>{on ? onLabel : offLabel}</span>;
}

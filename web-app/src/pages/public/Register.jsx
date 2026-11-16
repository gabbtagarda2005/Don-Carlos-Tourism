import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Home, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert, Spinner } from '../../components/ui';
import AuthShell from './AuthShell';

const ROLE_OPTIONS = [
  { value: 'tourist', label: 'Visitor', icon: Compass },
  { value: 'resident', label: 'Resident', icon: Home },
  { value: 'business_owner', label: 'Business', icon: Store },
];

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = ROLE_OPTIONS.some((r) => r.value === params.get('role')) ? params.get('role') : 'tourist';
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: initialRole });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await register(form);
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    return undefined;
  };

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop"
      quote="“Every journey into the highlands begins with a single, slow step.”"
      title="Join Don Carlos"
      subtitle="Save favourite places, review your visits, or list your business."
    >
      <form onSubmit={submit} className="space-y-5">
        <fieldset>
          <legend className="label">I am a…</legend>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  form.role === r.value ? 'border-forest-900 bg-forest-900 text-cream-50' : 'border-forest-900/15 text-forest-900/70 hover:border-forest-900/40'
                }`}
                aria-pressed={form.role === r.value}
              >
                <r.icon size={18} strokeWidth={1.5} /> {r.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="fn">First name</label>
            <input id="fn" required className="input" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
          </div>
          <div>
            <label className="label" htmlFor="ln">Last name</label>
            <input id="ln" required className="input" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="em">Email</label>
          <input id="em" type="email" required className="input" value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="ph">Phone <span className="normal-case tracking-normal text-forest-900/40">(optional)</span></label>
          <input id="ph" className="input" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" required minLength={8} className="input" value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        <Alert>{error}</Alert>
        <button className="btn-dark w-full !py-3.5" disabled={loading}>
          {loading && <Spinner />} Create account
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-forest-900/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest-900 underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

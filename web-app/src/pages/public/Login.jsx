import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Spinner } from '../../components/ui';
import AuthShell from './AuthShell';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const destination = (u) => location.state?.from || (['admin', 'developer'].includes(u.role) ? '/admin' : '/account');

  if (user) return <Navigate to={destination(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(destination(u), { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=80&auto=format&fit=crop"
      quote="“Welcome back. The lake has been waiting.”"
      title="Welcome back"
      subtitle="Sign in to save places, write reviews and manage your listings."
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Alert>{error}</Alert>
        <button className="btn-dark w-full !py-3.5" disabled={loading}>
          {loading && <Spinner />} Sign in
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-forest-900/60">
        New here?{' '}
        <Link to="/register" className="font-semibold text-forest-900 underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

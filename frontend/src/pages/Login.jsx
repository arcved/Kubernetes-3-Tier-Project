import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Boxes,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';
import { APP_NAME } from '../config.js';
import ThemeToggle from '../components/ThemeToggle.jsx';

const FEATURES = [
  { icon: TrendingUp, title: 'Real-time stock tracking', text: 'See quantities and value update instantly.' },
  { icon: BellRing, title: 'Low-stock alerts', text: 'Spot items that need reordering at a glance.' },
  { icon: ShieldCheck, title: 'Secure access', text: 'JWT-protected accounts for your team.' },
];

const DEMO = { email: 'admin@example.com', password: 'admin123' };

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const isLogin = mode === 'login';
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth-hero">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-pattern" />

        <div className="brand brand-light">
          <div className="brand-mark">
            <Boxes size={22} />
          </div>
          <span>{APP_NAME}</span>
        </div>

        <div className="auth-hero-body">
          <h1>
            Take control of
            <br />
            your inventory.
          </h1>
          <p>Track products, monitor stock levels and know exactly what your inventory is worth — all in one place.</p>

          <ul className="features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="feature-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card" aria-hidden="true">
          <div className="glass-head">
            <span>Stock overview</span>
            <span className="pill-up">
              <TrendingUp size={12} /> healthy
            </span>
          </div>
          <div className="bars">
            {[55, 80, 40, 95, 65, 75, 50].map((h, i) => (
              <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <ThemeToggle className="auth-theme" />

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="brand mobile-only">
            <div className="brand-mark">
              <Boxes size={20} />
            </div>
            <span>{APP_NAME}</span>
          </div>

          <h2>{isLogin ? 'Welcome back 👋' : 'Create your account'}</h2>
          <p className="muted">
            {isLogin ? 'Sign in to manage your inventory.' : 'Get started in less than a minute.'}
          </p>

          <div className="segmented" role="tablist">
            <button type="button" className={isLogin ? 'active' : ''} onClick={() => switchMode('login')}>
              Login
            </button>
            <button type="button" className={!isLogin ? 'active' : ''} onClick={() => switchMode('register')}>
              Register
            </button>
            <span className="segmented-thumb" style={{ transform: `translateX(${isLogin ? 0 : 100}%)` }} />
          </div>

          {error && <div className="alert">{error}</div>}

          {!isLogin && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <div className="input-icon">
                <User size={18} />
                <input id="name" name="name" placeholder="Jane Doe" value={form.name} onChange={onChange} required />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <div className="input-icon">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={onChange}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-icon">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={onChange}
                minLength={6}
                required
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn primary block lg" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                {isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={18} />
              </>
            )}
          </button>

          {isLogin && (
            <button
              type="button"
              className="demo"
              onClick={() => setForm({ ...form, ...DEMO })}
              title="Fill in demo credentials"
            >
              <span>Demo account</span>
              <code>
                {DEMO.email} / {DEMO.password}
              </code>
            </button>
          )}
        </form>
      </main>
    </div>
  );
}

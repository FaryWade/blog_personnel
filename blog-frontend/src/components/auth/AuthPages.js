import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

// ===================== REGISTER =====================
export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: '', username: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        full_name: form.full_name,
        username: form.username,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez la communauté des blogueurs">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="input-group">
          <label>Nom complet</label>
          <input className="input" name="full_name" value={form.full_name} onChange={handle}
            placeholder="Jean Dupont" required />
        </div>
        <div className="input-group">
          <label>Nom d'utilisateur</label>
          <input className="input" name="username" value={form.username} onChange={handle}
            placeholder="jean_dupont" required />
        </div>
        <div className="input-group">
          <label>Mot de passe</label>
          <input className="input" type="password" name="password" value={form.password}
            onChange={handle} placeholder="••••••••" required minLength={6} />
        </div>
        <div className="input-group">
          <label>Confirmer le mot de passe</label>
          <input className="input" type="password" name="password_confirm" value={form.password_confirm}
            onChange={handle} placeholder="••••••••" required />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Se connecter</a>
        </p>
      </form>
    </AuthLayout>
  );
}

// ===================== LOGIN =====================
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bon retour !" subtitle="Connectez-vous pour accéder à votre blog">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="input-group">
          <label>Nom d'utilisateur</label>
          <input className="input" name="username" value={form.username} onChange={handle}
            placeholder="jean_dupont" required autoFocus />
        </div>
        <div className="input-group">
          <label>Mot de passe</label>
          <input className="input" type="password" name="password" value={form.password}
            onChange={handle} placeholder="••••••••" required />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>S'inscrire</a>
        </p>
      </form>
    </AuthLayout>
  );
}

// ===================== LAYOUT =====================
function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: 42, height: 42, background: 'var(--accent)',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 900,
            }}>B</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--ink)' }}>
              BlogPersonnel
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{subtitle}</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-body" style={{ padding: '32px' }}>
            {children}
          </div>
        </div>

        {/* Decorative line */}
        <p style={{
          textAlign: 'center', marginTop: '24px', fontSize: '0.75rem',
          color: 'var(--muted-light)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Votre espace d'expression personnelle
        </p>
      </div>
    </div>
  );
}

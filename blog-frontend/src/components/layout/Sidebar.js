import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { friendsAPI } from '../../services/api';

const NAV = [
  { path: '/dashboard', icon: '⊞', label: 'Tableau de bord' },
  { path: '/articles', icon: '✦', label: 'Mes Articles' },
  { path: '/friends', icon: '◎', label: 'Amis' },
  { path: '/search', icon: '⊕', label: 'Rechercher' },
  { path: '/requests', icon: '◈', label: 'Demandes' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    friendsAPI.getRequests()
      .then(res => setPendingCount(res.data?.length || 0))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    navigate('/login');
  };

  const NavItem = ({ path, icon, label, badge }) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => { navigate(path); setMobileOpen(false); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '10px 16px', border: 'none',
          borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
          fontSize: '0.875rem', fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400,
          background: active ? 'rgba(192,57,43,0.1)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--ink-light)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {badge > 0 && <span className="badge-count">{badge}</span>}
      </button>
    );
  };

  const SidebarContent = () => (
    <div style={{
      width: 'var(--sidebar-w)', height: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'var(--white)', borderRight: '1px solid var(--paper-dark)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '2px 0 12px rgba(26,16,8,0.04)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px', borderBottom: '1px solid var(--paper-dark)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: 34, height: 34, background: 'var(--accent)',
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem',
          flexShrink: 0,
        }}>B</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
          BlogPersonnel
        </span>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--paper-dark)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 8,
          fontFamily: 'var(--font-display)',
        }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>{user?.full_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>@{user?.username}</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 16px 4px' }}>
          Navigation
        </div>
        {NAV.map(item => (
          <NavItem key={item.path} {...item}
            badge={item.path === '/requests' ? pendingCount : 0}
          />
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--paper-dark)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '10px 16px', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
            background: 'transparent', color: 'var(--muted)',
            fontSize: '0.875rem', fontFamily: 'var(--font-body)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fdecea'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          <span style={{ fontSize: '1rem' }}>⇥</span>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div style={{ display: 'none' }} className="desktop-sidebar"><SidebarContent /></div>
      <SidebarContent />

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16,
          zIndex: 200, background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer',
        }}
        className="mobile-menu-btn"
      >☰</button>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { articlesAPI } from '../../services/api';
import ArticleCard from '../articles/ArticleCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | mine | friends

  useEffect(() => {
    articlesAPI.getAll()
      .then(res => setArticles(res.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    if (filter === 'mine') return a.author?.username === user?.username;
    if (filter === 'friends') return a.author?.username !== user?.username;
    return true;
  });

  const myCount = articles.filter(a => a.author?.username === user?.username).length;
  const friendsCount = articles.filter(a => a.author?.username !== user?.username).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <h1>Bonjour, {user?.full_name?.split(' ')[0]} 👋</h1>
        </div>
        <p style={{ marginTop: 6 }}>Voici le fil d'actualité de votre blog personnel.</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        <StatCard icon="✦" label="Mes articles" value={myCount} color="var(--accent)" />
        <StatCard icon="◎" label="Articles d'amis" value={friendsCount} color="var(--accent-warm)" />
        <StatCard icon="⊞" label="Total dans le fil" value={articles.length} color="#2ecc71" />
      </div>

      {/* Create CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-light) 100%)',
        borderRadius: '10px', padding: '24px 28px', marginBottom: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Envie d'écrire ?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>
            Partagez vos idées avec vos amis
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/articles')}
          style={{ background: 'var(--accent)', color: 'white', flexShrink: 0 }}>
          ✦ Nouvel article
        </button>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: 'Tout le fil' },
          { key: 'mine', label: 'Mes articles' },
          { key: 'friends', label: 'Mes amis' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <h3>Aucun article ici</h3>
          <p>
            {filter === 'friends'
              ? 'Ajoutez des amis pour voir leurs articles publics.'
              : 'Créez votre premier article dès maintenant !'}
          </p>
          {filter !== 'friends' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }}
              onClick={() => navigate('/articles')}>
              Créer un article
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} onDeleted={() => {}} showAuthor />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-body" style={{ padding: '20px' }}>
        <div style={{
          width: 36, height: 36, background: color + '20',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', color, marginBottom: 10,
        }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

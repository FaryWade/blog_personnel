import React, { useState, useEffect } from 'react';
import { articlesAPI } from '../../services/api';
import ArticleCard from './ArticleCard';
import ArticleForm from './ArticleForm';

export default function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    articlesAPI.getMine()
      .then(res => setArticles(res.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (saved) => {
    if (editArticle) {
      setArticles(a => a.map(x => x.id === saved.id ? saved : x));
    } else {
      setArticles(a => [saved, ...a]);
    }
    setShowForm(false);
    setEditArticle(null);
  };

  const handleDeleted = (id) => {
    setArticles(a => a.filter(x => x.id !== id));
  };

  const openEdit = (article) => {
    setEditArticle(article);
    setShowForm(true);
  };

  const filtered = articles.filter(a => {
    if (filter === 'public') return a.is_public;
    if (filter === 'private') return !a.is_public;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Mes Articles</h1>
            <p>{articles.length} article{articles.length !== 1 ? 's' : ''} rédigé{articles.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditArticle(null); setShowForm(true); }}>
            ✦ Nouvel article
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs">
        {[
          { key: 'all', label: `Tous (${articles.length})` },
          { key: 'public', label: `Publics (${articles.filter(a => a.is_public).length})` },
          { key: 'private', label: `Privés (${articles.filter(a => !a.is_public).length})` },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <h3>Aucun article</h3>
          <p>Commencez à écrire votre premier article.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }}
            onClick={() => { setEditArticle(null); setShowForm(true); }}>
            Créer mon premier article
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onDeleted={handleDeleted}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ArticleForm
          article={editArticle}
          onClose={() => { setShowForm(false); setEditArticle(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

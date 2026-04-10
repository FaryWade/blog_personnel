import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { articlesAPI } from '../../services/api';

export default function ArticleCard({ article, onDeleted, showAuthor = false, onEdit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = article.author?.username === user?.username || article.user_id === user?.id;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cet article définitivement ?')) return;
    try {
      await articlesAPI.delete(article.id);
      onDeleted && onDeleted(article.id);
    } catch {
      alert('Impossible de supprimer cet article.');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const preview = article.content
    ? article.content.replace(/<[^>]*>/g, '').slice(0, 180) + (article.content.length > 180 ? '…' : '')
    : '';

  return (
    <div className="card" style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/articles/${article.id}`)}>
      <div className="card-body">
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {showAuthor && (
            <>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>
                {article.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                {article.author?.full_name || article.author?.username}
              </span>
              <span style={{ color: 'var(--muted-light)', fontSize: '0.75rem' }}>·</span>
            </>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{formatDate(article.created_at)}</span>
          <span className={`badge badge-${article.is_public ? 'public' : 'private'}`} style={{ marginLeft: 'auto' }}>
            {article.is_public ? '🌐 Public' : '🔒 Privé'}
          </span>
          {!article.allow_comments && (
            <span className="badge" style={{ background: 'var(--paper-dark)', color: 'var(--muted)' }}>
              💬 Fermé
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)', marginBottom: '8px',
          color: 'var(--ink)', fontSize: '1.15rem',
        }}>
          {article.title}
        </h3>

        {/* Preview */}
        {preview && (
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            {preview}
          </p>
        )}

        {/* Actions for owner */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--paper-dark)' }}
            onClick={e => e.stopPropagation()}>
            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(article); }}>
              ✏️ Modifier
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              🗑 Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

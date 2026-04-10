import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { articlesAPI, commentsAPI } from '../../services/api';
import ArticleForm from './ArticleForm';

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      articlesAPI.getOne(id),
      commentsAPI.getByArticle(id),
    ]).then(([aRes, cRes]) => {
      setArticle(aRes.data);
      setComments(cRes.data || []);
    }).catch(() => {
      setError('Article introuvable ou accès non autorisé.');
    }).finally(() => setLoading(false));
  }, [id]);

  const isOwner = article?.author?.username === user?.username || article?.user_id === user?.id;

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cet article ?')) return;
    await articlesAPI.delete(id);
    navigate('/articles');
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentsAPI.create(id, { content: newComment });
      setComments(c => [...c, res.data]);
      setNewComment('');
    } catch {
      alert('Impossible d\'envoyer le commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    await commentsAPI.delete(id, commentId);
    setComments(c => c.filter(x => x.id !== commentId));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Retour</button>
    </div>
  );

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
        ← Retour
      </button>

      {/* Article */}
      <article className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: '32px 36px' }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}>
              {article.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{article.author?.full_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>@{article.author?.username} · {formatDate(article.created_at)}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`badge badge-${article.is_public ? 'public' : 'private'}`}>
                {article.is_public ? '🌐 Public' : '🔒 Privé'}
              </span>
              {!article.allow_comments && <span className="badge badge-private">💬 Commentaires fermés</span>}
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '20px', lineHeight: 1.3 }}>
            {article.title}
          </h1>

          <hr className="divider" />

          {/* Content */}
          <div style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--ink-light)', whiteSpace: 'pre-wrap' }}>
            {article.content}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <>
              <hr className="divider" />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Supprimer</button>
              </div>
            </>
          )}
        </div>
      </article>

      {/* Comments */}
      <section>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
          💬 Commentaires ({comments.length})
        </h3>

        {/* Comment form */}
        {article.allow_comments ? (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body">
              <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea className="input" value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Écrivez un commentaire..." rows={3} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-sm" type="submit" disabled={submitting || !newComment.trim()}>
                    {submitting ? 'Envoi...' : 'Commenter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">Les commentaires sont désactivés pour cet article.</div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p>Aucun commentaire pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map(c => (
              <div key={c.id} className="card">
                <div className="card-body" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--paper-dark)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)',
                    }}>
                      {c.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.author?.full_name || c.author?.username}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 'auto' }}>{formatDate(c.created_at)}</span>
                    {(c.author?.username === user?.username || isOwner) && (
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteComment(c.id)}
                        style={{ color: 'var(--accent)', padding: '2px 6px' }}>✕</button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', margin: 0 }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <ArticleForm
          article={article}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { setArticle(updated); setEditing(false); }}
        />
      )}
    </div>
  );
}

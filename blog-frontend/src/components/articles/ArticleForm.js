import React, { useState, useEffect } from 'react';
import { articlesAPI } from '../../services/api';

export default function ArticleForm({ article, onClose, onSaved }) {
  const editing = !!article;
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_public: true,
    allow_comments: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title || '',
        content: article.content || '',
        is_public: article.is_public ?? true,
        allow_comments: article.allow_comments ?? true,
      });
    }
  }, [article]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Le titre et le contenu sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let res;
      if (editing) {
        res = await articlesAPI.update(article.id, form);
      } else {
        res = await articlesAPI.create(form);
      }
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-display)' }}>
            {editing ? '✏️ Modifier l\'article' : '✦ Nouvel article'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Titre</label>
              <input className="input" name="title" value={form.title} onChange={handle}
                placeholder="Un titre accrocheur..." required autoFocus />
            </div>

            <div className="input-group">
              <label>Contenu</label>
              <textarea className="input" name="content" value={form.content} onChange={handle}
                placeholder="Rédigez votre article ici..." rows={8} required />
            </div>

            <div className="toggle-group">
              <div className="toggle-item">
                <label htmlFor="is_public">🌐 Article public</label>
                <label className="toggle">
                  <input type="checkbox" id="is_public" name="is_public"
                    checked={form.is_public} onChange={handle} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="toggle-item">
                <label htmlFor="allow_comments">💬 Autoriser les commentaires</label>
                <label className="toggle">
                  <input type="checkbox" id="allow_comments" name="allow_comments"
                    checked={form.allow_comments} onChange={handle} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            <div style={{
              padding: '12px 14px', background: 'var(--paper)',
              borderRadius: '6px', fontSize: '0.8rem', color: 'var(--muted)',
              borderLeft: '3px solid var(--accent)',
            }}>
              {form.is_public
                ? '✓ Cet article sera visible par vos amis dans leur fil d\'actualité.'
                : '✓ Cet article restera privé — uniquement visible par vous.'}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : editing ? 'Sauvegarder' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

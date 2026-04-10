import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { friendsAPI } from '../../services/api';

export default function SearchFriends() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState({});
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const res = await friendsAPI.search(query.trim());
      setResults(res.data || []);
      setSearched(true);
    } catch {
      setError('Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      setSent(s => ({ ...s, [userId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible d\'envoyer la demande.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Rechercher</h1>
        <p>Trouvez des utilisateurs par nom d'utilisateur et ajoutez-les à votre cercle.</p>
      </div>

      {/* Search form */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-body">
          <form onSubmit={search} style={{ display: 'flex', gap: '12px' }}>
            <input
              className="input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par nom d'utilisateur..."
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
              {loading ? '...' : '⊕ Rechercher'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Results */}
      {searched && (
        <>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '16px' }}>
            {results.length} résultat{results.length !== 1 ? 's' : ''} pour « {query} »
          </p>

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⊕</div>
              <h3>Aucun utilisateur trouvé</h3>
              <p>Essayez un autre nom d'utilisateur.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map(u => {
                const isSelf = u.username === user?.username;
                const hasSent = sent[u.id];
                return (
                  <div key={u.id} className="card">
                    <div className="card-body" style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                      }}>
                        {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{u.username}</div>
                      </div>
                      {!isSelf && (
                        <button
                          className={`btn btn-sm ${hasSent ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => !hasSent && sendRequest(u.id)}
                          disabled={hasSent || u.is_friend}
                        >
                          {hasSent || u.is_friend
                            ? (u.is_friend ? '✓ Déjà ami' : '✓ Demande envoyée')
                            : '+ Ajouter'}
                        </button>
                      )}
                      {isSelf && (
                        <span className="badge badge-private">Vous</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="empty-state">
          <div className="empty-icon">⊕</div>
          <h3>Recherchez un utilisateur</h3>
          <p>Entrez un nom d'utilisateur dans la barre de recherche ci-dessus.</p>
        </div>
      )}
    </div>
  );
}

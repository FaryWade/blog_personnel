import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../../services/api';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    friendsAPI.getList()
      .then(res => setFriends(res.data || []))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, []);

  const setAction = (id, val) => setActionLoading(p => ({ ...p, [id]: val }));

  const handleRemove = async (friendId) => {
    if (!window.confirm('Retirer cet ami de votre liste ?')) return;
    setAction(friendId, 'remove');
    try {
      await friendsAPI.remove(friendId);
      setFriends(f => f.filter(x => x.id !== friendId));
    } catch {
      alert('Impossible de retirer cet ami.');
    } finally {
      setAction(friendId, null);
    }
  };

  const handleBlock = async (friendId) => {
    if (!window.confirm('Bloquer cet utilisateur ? Il ne pourra plus voir vos articles publics.')) return;
    setAction(friendId, 'block');
    try {
      await friendsAPI.block(friendId);
      setFriends(f => f.filter(x => x.id !== friendId));
    } catch {
      alert('Impossible de bloquer cet utilisateur.');
    } finally {
      setAction(friendId, null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Mes Amis</h1>
        <p>{friends.length} ami{friends.length !== 1 ? 's' : ''} dans votre cercle</p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : friends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <h3>Aucun ami pour l'instant</h3>
          <p>Utilisez la recherche pour trouver des utilisateurs et leur envoyer une invitation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {friends.map(friend => (
            <div key={friend.id} className="card">
              <div className="card-body" style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                }}>
                  {friend.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>
                    {friend.full_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{friend.username}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRemove(friend.id)}
                    disabled={!!actionLoading[friend.id]}
                  >
                    {actionLoading[friend.id] === 'remove' ? '...' : '✕ Retirer'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleBlock(friend.id)}
                    disabled={!!actionLoading[friend.id]}
                  >
                    {actionLoading[friend.id] === 'block' ? '...' : '⊘ Bloquer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

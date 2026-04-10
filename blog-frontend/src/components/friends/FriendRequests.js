import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../../services/api';

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    friendsAPI.getRequests()
      .then(res => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const setAction = (id, val) => setActionLoading(p => ({ ...p, [id]: val }));

  const accept = async (req) => {
    setAction(req.id, 'accept');
    try {
      await friendsAPI.acceptRequest(req.id);
      setRequests(r => r.filter(x => x.id !== req.id));
    } catch {
      alert('Impossible d\'accepter la demande.');
    } finally {
      setAction(req.id, null);
    }
  };

  const reject = async (req) => {
    setAction(req.id, 'reject');
    try {
      await friendsAPI.rejectRequest(req.id);
      setRequests(r => r.filter(x => x.id !== req.id));
    } catch {
      alert('Impossible de refuser la demande.');
    } finally {
      setAction(req.id, null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          Demandes d'amis
          {requests.length > 0 && (
            <span className="badge-count" style={{ marginLeft: 12, verticalAlign: 'middle' }}>
              {requests.length}
            </span>
          )}
        </h1>
        <p>Gérez les invitations que vous avez reçues.</p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <h3>Aucune demande en attente</h3>
          <p>Vous recevrez ici les invitations d'amis envoyées par d'autres utilisateurs.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(req => {
            const sender = req.sender || req.user || {};
            return (
              <div key={req.id} className="card">
                <div className="card-body" style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', flexWrap: 'wrap',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00b894, #00cec9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {sender.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>
                      {sender.full_name || 'Utilisateur inconnu'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      @{sender.username} · souhaite vous ajouter
                    </div>
                  </div>

                  {/* Pending badge */}
                  <span className="badge badge-pending">En attente</span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => accept(req)}
                      disabled={!!actionLoading[req.id]}
                    >
                      {actionLoading[req.id] === 'accept' ? '...' : '✓ Accepter'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => reject(req)}
                      disabled={!!actionLoading[req.id]}
                    >
                      {actionLoading[req.id] === 'reject' ? '...' : '✕ Refuser'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

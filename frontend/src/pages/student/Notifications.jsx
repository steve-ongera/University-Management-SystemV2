/**
 * pages/student/Notifications.jsx
 */

import { useState, useEffect } from 'react';
import { studentNotifications } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function StudentNotifications() {
  const { flash } = useFlash();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  async function load() {
    try {
      const res = await studentNotifications.list();
      setNotifs(res.data.results ?? res.data);
    } catch {
      flash('Could not load notifications.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    try {
      await studentNotifications.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      flash('Could not mark as read.', 'danger');
    }
  }

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return n.is_read;
    return true;
  });

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Notifications</li>
        </ol>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Notifications</h1>
          <p className="page-header__sub">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-notification-3-line" style={{ marginRight: 6 }} />All Notifications</h5>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {['all', 'unread', 'read'].map(f => (
              <button key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="ri-notification-off-line" />
              <p>No {filter !== 'all' ? filter : ''} notifications.</p>
            </div>
          ) : (
            filtered.map(n => (
              <div key={n.id} style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: n.is_read ? 'transparent' : 'var(--primary-light)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 16,
                }}>
                  <i className="ri-notification-3-line" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.title || n.message}</div>
                  {n.title && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {n.created_date ? new Date(n.created_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                {!n.is_read && (
                  <button className="btn-icon" title="Mark as read" onClick={() => markRead(n.id)}>
                    <i className="ri-check-double-line" style={{ color: 'var(--primary)' }} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
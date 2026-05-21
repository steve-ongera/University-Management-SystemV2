/**
 * pages/student/MessagesInbox.jsx
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messages } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function MessagesInbox() {
  const { flash } = useFlash();
  const [inbox,   setInbox]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await messages.list({ box: 'inbox' });
        setInbox(res.data.results ?? res.data);
      } catch {
        flash('Could not load inbox.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = inbox.filter(m =>
    !search ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.sender_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Messages</li>
        </ol>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Inbox</h1>
          <p className="page-header__sub">{inbox.filter(m => !m.is_read).length} unread messages</p>
        </div>
        <div className="page-header__actions">
          <Link to="/student/messages/sent" className="btn btn-secondary btn-sm">
            <i className="ri-send-plane-line" /> Sent
          </Link>
          <Link to="/student/messages/compose" className="btn btn-primary btn-sm">
            <i className="ri-edit-2-line" /> Compose
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-inbox-line" style={{ marginRight: 6 }} />Inbox</h5>
          <div style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search messages…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="ri-inbox-unarchive-line" /><p>Your inbox is empty.</p></div>
          ) : (
            filtered.map(m => (
              <Link key={m.id} to={`/student/messages/${m.id}`}
                style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  background: m.is_read ? 'transparent' : 'var(--primary-light)', textDecoration: 'none', color: 'inherit' }}>
                <span style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {(m.sender_name?.[0] || '?').toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: m.is_read ? 400 : 600 }}>{m.sender_name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                      {m.sent_date ? new Date(m.sent_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  <div style={{ fontWeight: m.is_read ? 400 : 600, fontSize: 13, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.subject}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.body?.slice(0, 80)}…
                  </div>
                </div>
                {!m.is_read && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
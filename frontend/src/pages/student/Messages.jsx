/**
 * pages/student/ComposeMessage.jsx
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messages } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export function ComposeMessage() {
  const { flash } = useFlash();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ recipient_username: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!form.recipient_username || !form.subject || !form.body) {
      flash('All fields are required.', 'warning'); return;
    }
    setSending(true);
    try {
      await messages.send(form);
      flash('Message sent.', 'success');
      navigate('/student/messages');
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to send message.', 'danger');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><a href="/student/messages">Messages</a></li>
          <li className="breadcrumb-item active">Compose</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">New Message</h1></div>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><h5>Compose Message</h5></div>
        <form onSubmit={handleSend}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">To (username) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-control" placeholder="e.g. jane.lecturer" value={form.recipient_username}
                  onChange={e => setForm(f => ({ ...f, recipient_username: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-control" placeholder="Message subject" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea className="form-control" rows={6} placeholder="Write your message here…" value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sending…</> : <><i className="ri-send-plane-fill" /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * pages/student/MessageDetail.jsx
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export function MessageDetail() {
  const { id } = useParams();
  const { flash } = useFlash();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await messages.get(id);
        setMessage(res.data);
      } catch {
        flash('Could not load message.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading…</div></div>;
  if (!message) return null;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><a href="/student/messages">Messages</a></li>
          <li className="breadcrumb-item active">View</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">{message.subject}</h1></div>
        <div className="page-header__actions">
          <Link to={`/student/messages/compose?reply=${message.sender_name}`} className="btn btn-primary btn-sm">
            <i className="ri-reply-line" /> Reply
          </Link>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {(message.sender_name?.[0] || '?').toUpperCase()}
            </span>
            <div>
              <div style={{ fontWeight: 600 }}>{message.sender_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                To: {message.recipient_name} · {message.sent_date ? new Date(message.sent_date).toLocaleString('en-KE') : ''}
              </div>
            </div>
          </div>
          <div style={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--text)' }}>{message.body}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * pages/student/SentMessages.jsx
 */
export function SentMessages() {
  const { flash } = useFlash();
  const [sent,    setSent]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await messages.list({ box: 'sent' });
        setSent(res.data.results ?? res.data);
      } catch {
        flash('Could not load sent messages.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><a href="/student/messages">Messages</a></li>
          <li className="breadcrumb-item active">Sent</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">Sent Messages</h1></div>
        <div className="page-header__actions">
          <Link to="/student/messages/compose" className="btn btn-primary btn-sm"><i className="ri-edit-2-line" /> Compose</Link>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading…</div>
          ) : sent.length === 0 ? (
            <div className="empty-state"><i className="ri-send-plane-line" /><p>No sent messages.</p></div>
          ) : (
            sent.map(m => (
              <Link key={m.id} to={`/student/messages/${m.id}`}
                style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>To: {m.recipient_name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {m.sent_date ? new Date(m.sent_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{m.subject}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
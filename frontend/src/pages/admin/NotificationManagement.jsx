import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const TYPE_BADGE = {
  general:     'badge-gray',
  academic:    'badge-primary',
  financial:   'badge-warning',
  hostel:      'badge-info',
  emergency:   'badge-danger',
  event:       'badge-success',
};

function NotificationModal({ notification, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(notification?.id);
  const [form, setForm] = useState({
    title:             notification?.title             || '',
    message:           notification?.message           || '',
    notification_type: notification?.notification_type || 'general',
    target_role:       notification?.target_role       || 'all',
    is_active:         notification?.is_active         ?? true,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      isEdit
        ? await notifications.update(notification.id, form)
        : await notifications.create(form);
      flash(`Notification ${isEdit ? 'updated' : 'sent'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save notification.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Notification' : 'Send Notification'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Title *</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="Notification title" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Type</label>
                <select className="form-select" name="notification_type" value={form.notification_type} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="financial">Financial</option>
                  <option value="hostel">Hostel</option>
                  <option value="emergency">Emergency</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Target Audience</label>
                <select className="form-select" name="target_role" value={form.target_role} onChange={handleChange}>
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="lecturer">Lecturers Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="finance">Finance Only</option>
                </select>
              </div>
              <div className="col-md-6" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  <span style={{ fontSize: 13 }}>Active / Visible</span>
                </label>
              </div>
              <div className="col-12">
                <label className="form-label">Message *</label>
                <textarea className="form-control" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Write your notification message here…" required />
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                : isEdit ? 'Update' : <><i className="ri-send-plane-line" /> Send Notification</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotificationManagement() {
  const { flash } = useFlash();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch]   = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await notifications.list({ type: filterType });
      setData(res.data.results ?? res.data);
    } catch { flash('Failed to load notifications.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterType]);

  async function deleteNotif(id) {
    if (!window.confirm('Delete this notification?')) return;
    try { await notifications.delete(id); flash('Deleted.', 'success'); load(); }
    catch { flash('Cannot delete.', 'danger'); }
  }

  const q = search.toLowerCase();
  const filtered = data.filter(n =>
    !q || n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
  );

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Notifications</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Notification Management</h1>
          <p className="page-header__sub">Send and manage system-wide notifications</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-send-plane-line" /> Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total',     value: data.length,                                color: 'primary', icon: 'ri-notification-line' },
          { label: 'Active',    value: data.filter(n => n.is_active).length,       color: 'success', icon: 'ri-notification-badge-line' },
          { label: 'Emergency', value: data.filter(n => n.notification_type === 'emergency').length, color: 'danger', icon: 'ri-alarm-warning-line' },
          { label: 'Academic',  value: data.filter(n => n.notification_type === 'academic').length,  color: 'info',  icon: 'ri-book-open-line' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${s.color}`}><i className={s.icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-notification-line" /> Notifications</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="hostel">Hostel</option>
              <option value="emergency">Emergency</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="ri-notification-off-line" /><p>No notifications found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Recipients</th>
                    <th>Sent By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(n => (
                    <tr key={n.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.message}
                        </div>
                      </td>
                      <td><span className={`badge ${TYPE_BADGE[n.notification_type] || 'badge-gray'}`}>{n.notification_type}</span></td>
                      <td style={{ textTransform: 'capitalize' }}>{n.target_role || 'all'}</td>
                      <td>{n.recipients_count ?? '—'}</td>
                      <td>{n.sender_name}</td>
                      <td style={{ fontSize: 12 }}>{n.created_at ? new Date(n.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge ${n.is_active ? 'badge-success' : 'badge-gray'}`}>
                          {n.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setModal(n)}><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteNotif(n.id)}><i className="ri-delete-bin-line" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <NotificationModal
          notification={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
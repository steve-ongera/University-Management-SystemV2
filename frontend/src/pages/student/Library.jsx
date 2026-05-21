/**
 * pages/student/Library.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { library as libraryApi, students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export function Library() {
  const { flash } = useFlash();
  const [resources,     setResources]     = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');
  const [profile,       setProfile]       = useState(null);
  const [tab,           setTab]           = useState('browse');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await students.myProfile();
      setProfile(profileRes.data);
      const [libRes, txRes] = await Promise.all([
        libraryApi.list({ search, resource_type: typeFilter }),
        libraryApi.transactionList({ user: profileRes.data.user?.id }),
      ]);
      setResources(libRes.data.results ?? libRes.data);
      setTransactions(txRes.data.results ?? txRes.data);
    } catch {
      flash('Could not load library.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const statusBadge = (status) => {
    const map = { active: 'badge-primary', returned: 'badge-success', overdue: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Library</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">Library</h1><p className="page-header__sub">Browse and borrow resources</p></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['browse', 'my-books'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'browse' ? 'Browse Resources' : 'My Borrowed Books'}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-book-2-line" style={{ marginRight: 6 }} />Resources</h5>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <div className="search-bar">
                <i className="ri-search-line" />
                <input className="form-control" placeholder="Search title, author, ISBN…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 150 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="book">Book</option>
                <option value="journal">Journal</option>
                <option value="ebook">E-Book</option>
                <option value="thesis">Thesis</option>
              </select>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-block"><span className="spinner" />Loading…</div>
            ) : resources.length === 0 ? (
              <div className="empty-state"><i className="ri-book-search-line" /><p>No resources found.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr><th>Title</th><th>Author</th><th>Type</th><th>ISBN</th><th>Available</th></tr>
                  </thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.title}</td>
                        <td>{r.author}</td>
                        <td><span className="badge badge-gray">{r.resource_type}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.isbn || '—'}</td>
                        <td>
                          <span className={`badge ${r.available ? 'badge-success' : 'badge-danger'}`}>
                            {r.available ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'my-books' && (
        <div className="card">
          <div className="card-header"><h5>My Borrowed Books</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-block"><span className="spinner" />Loading…</div>
            ) : transactions.length === 0 ? (
              <div className="empty-state"><i className="ri-book-line" /><p>You have not borrowed any books.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr><th>Resource</th><th>Borrowed</th><th>Due Date</th><th>Returned</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => {
                      const isOverdue = t.status === 'active' && t.due_date && new Date(t.due_date) < new Date();
                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 500 }}>{t.resource_title}</td>
                          <td>{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-KE') : '—'}</td>
                          <td style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                            {t.due_date ? new Date(t.due_date).toLocaleDateString('en-KE') : '—'}
                            {isOverdue && ' ⚠'}
                          </td>
                          <td>{t.return_date ? new Date(t.return_date).toLocaleDateString('en-KE') : '—'}</td>
                          <td>{statusBadge(isOverdue ? 'overdue' : t.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * pages/student/ChangePassword.jsx
 */
import { useState } from 'react';
import { auth } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export function ChangePassword() {
  const { flash } = useFlash();
  const [form,   setForm]   = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [show,   setShow]   = useState({ old: false, new: false, confirm: false });

  function validate() {
    const errs = {};
    if (!form.old_password) errs.old_password = 'Required';
    if (!form.new_password || form.new_password.length < 8) errs.new_password = 'Minimum 8 characters';
    if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await auth.changePassword(form);
      flash('Password changed successfully. Please log in again.', 'success');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      flash(err.response?.data?.detail || err.response?.data?.old_password || 'Could not change password.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  const ToggleBtn = ({ field }) => (
    <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
      <i className={`ri-eye${show[field] ? '-off' : ''}-line`} />
    </button>
  );

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><a href="/student/profile">Profile</a></li>
          <li className="breadcrumb-item active">Change Password</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">Change Password</h1><p className="page-header__sub">Update your account password</p></div>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header"><h5><i className="ri-lock-password-line" style={{ marginRight: 6 }} />Password</h5></div>
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="row g-3">
              {[
                ['old_password', 'Current Password', 'old'],
                ['new_password', 'New Password', 'new'],
                ['confirm_password', 'Confirm New Password', 'confirm'],
              ].map(([name, label, showKey]) => (
                <div className="col-12" key={name}>
                  <label className="form-label">{label} <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show[showKey] ? 'text' : 'password'}
                      className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                      name={name} value={form[name]}
                      onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })); }}
                      style={{ paddingRight: 36 }} />
                    <ToggleBtn field={showKey} />
                  </div>
                  {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : <><i className="ri-lock-password-line" /> Change Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Library;
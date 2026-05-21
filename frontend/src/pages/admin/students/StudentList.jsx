import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function StatusBadge({ status }) {
  const map = { active: 'badge-success', inactive: 'badge-gray', suspended: 'badge-danger', graduated: 'badge-primary', deferred: 'badge-warning' };
  return <span className={`badge ${map[status?.toLowerCase()] || 'badge-gray'}`}>{status || '—'}</span>;
}

async function confirmDel(name) {
  if (window.Swal) {
    const r = await window.Swal.fire({ title: 'Delete student?', html: `<strong>${name}</strong> will be removed.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#d93025' });
    return r.isConfirmed;
  }
  return window.confirm(`Delete ${name}?`);
}

function StudentModal({ student, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(student?.id);
  const [form, setForm] = useState({
    username: student?.user?.username || '',
    first_name: student?.user?.first_name || '',
    last_name: student?.user?.last_name || '',
    email: student?.user?.email || '',
    phone: student?.user?.phone || '',
    gender: student?.user?.gender || '',
    status: student?.status || 'active',
    current_year: student?.current_year || 1,
    current_semester: student?.current_semester || 1,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim())  errs.last_name  = 'Required';
    if (!form.email.trim())      errs.email      = 'Required';
    if (!isEdit && !form.username.trim()) errs.username = 'Required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await students.patch(student.id, form);
        flash('Student updated.', 'success');
      } else {
        await students.create({ ...form, password: 'Temp@1234', user_type: 'student' });
        flash('Student created.', 'success');
      }
      onSaved();
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to save.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Student' : 'Add Student'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              {!isEdit && (
                <div className="col-md-6">
                  <label className="form-label">Username *</label>
                  <input className={`form-control ${errors.username ? 'is-invalid' : ''}`} name="username" value={form.username} onChange={handleChange} placeholder="e.g. jane.mwangi" />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input className={`form-control ${errors.first_name ? 'is-invalid' : ''}`} name="first_name" value={form.first_name} onChange={handleChange} />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input className={`form-control ${errors.last_name ? 'is-invalid' : ''}`} name="last_name" value={form.last_name} onChange={handleChange} />
                {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} name="email" value={form.email} onChange={handleChange} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Year</label>
                <select className="form-select" name="current_year" value={form.current_year} onChange={handleChange}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Semester</label>
                <select className="form-select" name="current_semester" value={form.current_semester} onChange={handleChange}>
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="graduated">Graduated</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : (isEdit ? 'Save Changes' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentList() {
  const { flash } = useFlash();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [currentPage, setPage] = useState(1);
  const PER_PAGE = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await students.list({ search, status: filterStatus });
      setData(res.data.results ?? res.data);
    } catch {
      flash('Failed to load students.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  async function handleDelete(s) {
    const name = s.full_name || `${s.user?.first_name} ${s.user?.last_name}`;
    if (!await confirmDel(name)) return;
    try {
      await students.delete(s.id);
      flash('Student deleted.', 'success');
      fetchData();
    } catch { flash('Could not delete student.', 'danger'); }
  }

  const total    = data.length;
  const active   = data.filter(s => s.status === 'active').length;
  const deferred = data.filter(s => s.status === 'deferred').length;
  const graduated = data.filter(s => s.status === 'graduated').length;

  const filtered = data.filter(s => {
    const q = search.toLowerCase();
    const name = s.full_name || `${s.user?.first_name} ${s.user?.last_name}`;
    const matchQ = !q || name.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q);
    const matchS = !filterStatus || s.status === filterStatus;
    return matchQ && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Students</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Students</h1>
          <p className="page-header__sub">Manage all registered students</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-user-add-line" /> Add Student
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total', value: total,    icon: 'ri-group-line',          color: 'primary' },
          { label: 'Active', value: active,  icon: 'ri-checkbox-circle-line', color: 'success' },
          { label: 'Deferred', value: deferred, icon: 'ri-time-line',        color: 'warning' },
          { label: 'Graduated', value: graduated, icon: 'ri-medal-line',     color: 'info' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${s.color}`}><i className={s.icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label} Students</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-list-unordered" /> All Students</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search name, ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="deferred">Deferred</option>
              <option value="graduated">Graduated</option>
            </select>
            {(search || filterStatus) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setSearch(''); setFilterStatus(''); }}>
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading students…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state">
              <i className="ri-user-search-line" />
              <p>No students found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Programme</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s, idx) => {
                    const name = s.full_name || `${s.user?.first_name || ''} ${s.user?.last_name || ''}`;
                    return (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="avatar-initials">{name.trim()[0] || '?'}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{name.trim()}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.student_id}</td>
                        <td>{s.programme_name || '—'}</td>
                        <td>Year {s.current_year}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td>
                          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                            <Link to={`/admin/students/${s.id}`} className="btn-icon" title="View"><i className="ri-eye-line" /></Link>
                            <button className="btn-icon" title="Edit" onClick={() => setModal(s)}><i className="ri-pencil-line" /></button>
                            <button className="btn-icon" title="Performance" onClick={() => window.location.href = `/admin/students/${s.id}/performance`}><i className="ri-bar-chart-line" /></button>
                            <button className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(s)}><i className="ri-delete-bin-line" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="card-footer flex items-center justify-between flex-wrap">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}><i className="ri-arrow-left-s-line" /></button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
                  .map((p, i) => p === '...'
                    ? <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                    : <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(p)}>{p}</button></li>
                  )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}><i className="ri-arrow-right-s-line" /></button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {modal && (
        <StudentModal
          student={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}
    </div>
  );
}
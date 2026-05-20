/**
 * ExamplePage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * GUIDE PAGE — copy this file, rename it, and replace the data/API calls.
 *
 * Demonstrates every reusable pattern in the ERP:
 *   ✓ page-wrapper / page-header layout
 *   ✓ stats-grid KPI tiles
 *   ✓ card with table + search + filter bar
 *   ✓ loading spinner
 *   ✓ empty state
 *   ✓ badges / status chips
 *   ✓ action buttons (add, edit, delete, view)
 *   ✓ inline modal (add / edit form)
 *   ✓ flash messages via useFlash()
 *   ✓ API call with students.list() from api/api.js
 *   ✓ delete confirmation (SweetAlert2 style — pure JS fallback shown)
 *   ✓ breadcrumb
 *   ✓ pagination
 *
 * To make a new page:
 *   1. Copy this file.
 *   2. Replace `students.list()` with the relevant api call.
 *   3. Update columns, stat cards, and form fields.
 *   4. Done — all CSS comes from global.css.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { students } from '../api/api';          // ← swap for any resource
import { useFlash } from '../components/FlashMessages';

/* ─── Status badge helper ─────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active:     'badge-success',
    inactive:   'badge-gray',
    suspended:  'badge-danger',
    graduated:  'badge-primary',
    deferred:   'badge-warning',
  };
  const cls = map[status?.toLowerCase()] || 'badge-gray';
  return (
    <span className={`badge ${cls}`}>
      {status || '—'}
    </span>
  );
}

/* ─── Confirm delete (uses window.confirm as fallback — swap in SweetAlert2) ─ */
async function confirmDelete(message = 'Delete this record? This cannot be undone.') {
  // If SweetAlert2 is loaded globally:
  if (window.Swal) {
    const result = await window.Swal.fire({
      title: 'Are you sure?',
      html: message,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d93025',
      cancelButtonColor: '#1a73e8',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }
  // Plain browser fallback
  return window.confirm(message);
}

/* ─── Add / Edit Modal ────────────────────────────────────────────────────── */
function StudentModal({ student, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(student?.id);

  const [form, setForm] = useState({
    first_name:  student?.first_name  || '',
    last_name:   student?.last_name   || '',
    email:       student?.email       || '',
    reg_number:  student?.reg_number  || '',
    programme:   student?.programme   || '',
    year:        student?.year        || '1',
    status:      student?.status      || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim())  errs.last_name  = 'Required';
    if (!form.email.trim())      errs.email      = 'Required';
    if (!form.reg_number.trim()) errs.reg_number = 'Required';
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
        flash('Student updated successfully.', 'success');
      } else {
        await students.create(form);
        flash('Student created successfully.', 'success');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong.';
      flash(msg, 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Student' : 'Add Student'}</h5>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">

              {/* First name */}
              <div className="col-md-6">
                <label className="form-label">First Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Jane"
                />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>

              {/* Last name */}
              <div className="col-md-6">
                <label className="form-label">Last Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Mwangi"
                />
                {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@university.ac.ke"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Reg number */}
              <div className="col-md-6">
                <label className="form-label">Reg Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  className={`form-control ${errors.reg_number ? 'is-invalid' : ''}`}
                  name="reg_number"
                  value={form.reg_number}
                  onChange={handleChange}
                  placeholder="e.g. MUT/CS/001/2024"
                />
                {errors.reg_number && <div className="invalid-feedback">{errors.reg_number}</div>}
              </div>

              {/* Programme */}
              <div className="col-md-6">
                <label className="form-label">Programme</label>
                <input
                  className="form-control"
                  name="programme"
                  value={form.programme}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                />
              </div>

              {/* Year */}
              <div className="col-md-3">
                <label className="form-label">Year</label>
                <select className="form-select" name="year" value={form.year} onChange={handleChange}>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="col-md-3">
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : (isEdit ? 'Save Changes' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ExamplePage() {
  const { flash } = useFlash();

  /* State */
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilter]   = useState('');
  const [modal,      setModal]      = useState(null);   // null | 'add' | {student object for edit}
  const [currentPage, setPage]      = useState(1);
  const PER_PAGE = 10;

  /* Fetch */
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

  /* Delete */
  async function handleDelete(student) {
    const ok = await confirmDelete(
      `Do you really want to delete <strong>${student.first_name} ${student.last_name}</strong>?`
    );
    if (!ok) return;
    try {
      await students.delete(student.id);
      flash('Student deleted.', 'success');
      fetchData();
    } catch {
      flash('Could not delete student.', 'danger');
    }
  }

  /* Stats derived from loaded data */
  const total    = data.length;
  const active   = data.filter(s => s.status === 'active').length;
  const deferred = data.filter(s => s.status === 'deferred').length;
  const graduated = data.filter(s => s.status === 'graduated').length;

  /* Client-side pagination (if API returns everything at once) */
  const filtered = data.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q)  ||
      s.reg_number?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /* ── Render ── */
  return (
    <div className="page-wrapper">

      {/* ── Breadcrumb ── */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Students</li>
        </ol>
      </nav>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Students</h1>
          <p className="page-header__sub">Manage all registered students</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-secondary btn-sm">
            <i className="ri-download-line" /> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-user-add-line" /> Add Student
          </button>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary">
            <i className="ri-group-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{total}</div>
            <div className="stat-card__label">Total Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">
            <i className="ri-checkbox-circle-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{active}</div>
            <div className="stat-card__label">Active</div>
            <div className="stat-card__delta stat-card__delta--up">
              <i className="ri-arrow-up-line" />
              {total ? Math.round((active / total) * 100) : 0}% of total
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning">
            <i className="ri-time-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{deferred}</div>
            <div className="stat-card__label">Deferred</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info">
            <i className="ri-medal-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{graduated}</div>
            <div className="stat-card__label">Graduated</div>
          </div>
        </div>
      </div>

      {/* ── Main card: filter bar + table ── */}
      <div className="card">

        {/* Card header: search + filters */}
        <div className="card-header">
          <h5><i className="ri-list-unordered" style={{ marginRight: 6 }} />All Students</h5>

          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            {/* Search */}
            <div className="search-bar">
              <i className="ri-search-line" />
              <input
                className="form-control"
                placeholder="Search name, reg no…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status filter */}
            <select
              className="form-select"
              style={{ width: 140 }}
              value={filterStatus}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="deferred">Deferred</option>
              <option value="graduated">Graduated</option>
            </select>

            {/* Reset */}
            {(search || filterStatus) && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => { setSearch(''); setFilter(''); }}
              >
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Card body: table */}
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block">
              <span className="spinner" />
              Loading students…
            </div>
          ) : pageData.length === 0 ? (
            <div className="empty-state">
              <i className="ri-user-search-line" />
              <p>No students found{(search || filterStatus) ? ' for the current filters' : ''}.</p>
              {(search || filterStatus) && (
                <button className="btn btn-sm btn-secondary" onClick={() => { setSearch(''); setFilter(''); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Reg Number</th>
                    <th>Programme</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((student, idx) => (
                    <tr key={student.id}>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {(currentPage - 1) * PER_PAGE + idx + 1}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          {/* Avatar with initials fallback */}
                          {student.photo ? (
                            <img className="avatar" src={student.photo} alt="" />
                          ) : (
                            <span className="avatar-initials">
                              {(student.first_name?.[0] || '') + (student.last_name?.[0] || '')}
                            </span>
                          )}
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {student.first_name} {student.last_name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {student.reg_number}
                      </td>

                      <td style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.programme || '—'}
                      </td>

                      <td>Year {student.year || '—'}</td>

                      <td><StatusBadge status={student.status} /></td>

                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          {/* View */}
                          <Link
                            to={`/admin/students/${student.id}`}
                            className="btn-icon"
                            title="View"
                          >
                            <i className="ri-eye-line" />
                          </Link>

                          {/* Edit */}
                          <button
                            className="btn-icon"
                            title="Edit"
                            onClick={() => setModal(student)}
                          >
                            <i className="ri-pencil-line" />
                          </button>

                          {/* Delete */}
                          <button
                            className="btn-icon"
                            title="Delete"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleDelete(student)}
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card footer: pagination */}
        {!loading && totalPages > 1 && (
          <div className="card-footer flex items-center justify-between flex-wrap gap-3">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>

            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>
                    <i className="ri-arrow-left-s-line" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <li key={`e${i}`} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    ) : (
                      <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                      </li>
                    )
                  )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
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

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK REFERENCE — class / component cheatsheet
   ─────────────────────────────────────────────────────────────────────────────

   PAGE STRUCTURE
   ──────────────
   <div className="page-wrapper">                  root of every page
     <nav><ol className="breadcrumb">…</ol></nav>  optional breadcrumb
     <div className="page-header">                 title + action buttons
       <h1 className="page-header__title">
       <p  className="page-header__sub">
       <div className="page-header__actions">
     </div>
     <div className="stats-grid">                  KPI tile grid
       <div className="stat-card">
         <div className="stat-card__icon stat-card__icon--primary">
         <div className="stat-card__body">
           <div className="stat-card__value">
           <div className="stat-card__label">
           <div className="stat-card__delta stat-card__delta--up">
     <div className="card">                        main content card
       <div className="card-header">
       <div className="card-body">
       <div className="card-footer">
   </div>

   CARD ACCENT BORDERS
   ───────────────────
   card-primary / card-success / card-warning / card-danger / card-info

   TABLE
   ─────
   <div className="table-responsive">
     <table className="table">
       <thead><tr><th>…
       <tbody><tr><td>…

   FORM
   ────
   <label className="form-label">
   <input className="form-control">        or   <select className="form-select">
   <div className="invalid-feedback">
   textarea.form-control                   — auto-height

   BUTTONS
   ───────
   btn btn-primary / btn-secondary / btn-danger / btn-success
   btn btn-outline-primary / btn-light / btn-link
   btn btn-sm / btn-lg
   btn-icon                                — icon-only, no border

   BADGES
   ──────
   <span className="badge badge-success">Active</span>
   badge-primary / badge-success / badge-danger / badge-warning / badge-info / badge-gray

   STAT ICON COLOURS
   ─────────────────
   stat-card__icon--primary/success/warning/danger/info

   MODAL
   ─────
   <div className="modal-overlay">
     <div className="modal-box modal-box--sm|lg|xl">
       <div className="modal-box__header">
       <div className="modal-box__body">
       <div className="modal-box__footer">

   LOADING / EMPTY
   ───────────────
   <div className="loading-block"><span className="spinner" />…</div>
   <div className="empty-state"><i /><p>…</p></div>

   DETAIL VIEW INFO ROWS
   ─────────────────────
   <div className="info-row">
     <span className="info-row__label">Email</span>
     <span className="info-row__value">…</span>
   </div>

   FLASH MESSAGES
   ──────────────
   const { flash } = useFlash();
   flash('Saved!', 'success');     // success | danger | warning | info

   SEARCH BAR
   ──────────
   <div className="search-bar">
     <i className="ri-search-line" />
     <input className="form-control" placeholder="Search…" />
   </div>

   CSS VARIABLES (override in :root or a scoped selector)
   ───────────────────────────────────────────────────────
   --primary  --primary-dark  --primary-light  --primary-rgb
   --danger  --success  --warning  --info
   --navbar-height  --sidebar-width
   --radius  --radius-sm  --radius-lg
   --shadow-sm  --shadow  --shadow-md  --shadow-lg
   --font-size-base (13px)  --font-size-sm (12px)  --font-size-lg (15px)
   --transition  --transition-slow

───────────────────────────────────────────────────────────────────────────── */
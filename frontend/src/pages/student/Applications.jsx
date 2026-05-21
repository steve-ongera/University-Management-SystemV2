/**
 * pages/student/Applications.jsx
 * Deferment, Special Exam, and Clearance Request pages — all in one file.
 * Export each individually and re-export as default DefermentList for the main route.
 */

import { useState, useEffect } from 'react';
import { deferments, specialExams, clearances, students, courses, semesters } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

/* ─── Shared status badge ─────────────────────── */
function StatusBadge({ status }) {
  const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', under_review: 'badge-info' };
  return <span className={`badge ${map[status?.toLowerCase()] || 'badge-gray'}`}>{status || '—'}</span>;
}

/* ─────────────────────────────────────────────────
   DEFERMENT
───────────────────────────────────────────────── */
export function DefermentList() {
  const { flash } = useFlash();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [profile, setProfile] = useState(null);
  const [semList, setSemList] = useState([]);
  const [form,    setForm]    = useState({ semester: '', reason: '', supporting_document: null });

  async function load() {
    try {
      const profileRes = await students.myProfile();
      setProfile(profileRes.data);
      const [defRes, semRes] = await Promise.all([
        deferments.list({ student: profileRes.data.id }),
        semesters.list(),
      ]);
      setData(defRes.data.results ?? defRes.data);
      setSemList(semRes.data.results ?? semRes.data);
    } catch {
      flash('Could not load deferment applications.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.semester || !form.reason) { flash('Semester and reason are required.', 'warning'); return; }
    setSaving(true);
    try {
      await deferments.create({ student: profile.id, semester: form.semester, reason: form.reason });
      flash('Deferment application submitted.', 'success');
      setModal(false);
      setForm({ semester: '', reason: '', supporting_document: null });
      load();
    } catch (err) {
      flash(err.response?.data?.detail || 'Submission failed.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationsPage
      title="Deferment Applications"
      subtitle="Apply to defer your studies"
      data={data}
      loading={loading}
      onAdd={() => setModal(true)}
      columns={['Reason', 'Semester', 'Date', 'Status']}
      renderRow={d => (
        <tr key={d.id}>
          <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.reason}</td>
          <td>{d.semester_display || '—'}</td>
          <td>{d.application_date ? new Date(d.application_date).toLocaleDateString('en-KE') : '—'}</td>
          <td><StatusBadge status={d.status} /></td>
        </tr>
      )}
    >
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-box__header">
              <h5>Apply for Deferment</h5>
              <button className="modal-close" onClick={() => setModal(false)}><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-box__body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Semester <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select className="form-select" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                      <option value="">Select semester</option>
                      {semList.map(s => <option key={s.id} value={s.id}>{s.academic_year_display} — Sem {s.semester_number}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <textarea className="form-control" rows={4} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="State your reason clearly…" />
                  </div>
                </div>
              </div>
              <div className="modal-box__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationsPage>
  );
}

/* ─────────────────────────────────────────────────
   SPECIAL EXAM
───────────────────────────────────────────────── */
export function SpecialExamList() {
  const { flash } = useFlash();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [profile, setProfile] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [form, setForm] = useState({ course: '', reason: '' });

  async function load() {
    try {
      const profileRes = await students.myProfile();
      setProfile(profileRes.data);
      const [appRes, courseRes] = await Promise.all([
        specialExams.list({ student: profileRes.data.id }),
        courses.list(),
      ]);
      setData(appRes.data.results ?? appRes.data);
      setCourseList(courseRes.data.results ?? courseRes.data);
    } catch {
      flash('Could not load applications.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.course || !form.reason) { flash('All fields required.', 'warning'); return; }
    setSaving(true);
    try {
      await specialExams.create({ student: profile.id, course: form.course, reason: form.reason });
      flash('Special exam application submitted.', 'success');
      setModal(false);
      setForm({ course: '', reason: '' });
      load();
    } catch (err) {
      flash(err.response?.data?.detail || 'Submission failed.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationsPage
      title="Special Exam Applications"
      subtitle="Apply for a supplementary or special examination"
      data={data}
      loading={loading}
      onAdd={() => setModal(true)}
      columns={['Course', 'Reason', 'Date', 'Status']}
      renderRow={d => (
        <tr key={d.id}>
          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.course_code} — {d.course_name}</td>
          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.reason}</td>
          <td>{d.application_date ? new Date(d.application_date).toLocaleDateString('en-KE') : '—'}</td>
          <td><StatusBadge status={d.status} /></td>
        </tr>
      )}
    >
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-box__header">
              <h5>Apply for Special Exam</h5>
              <button className="modal-close" onClick={() => setModal(false)}><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-box__body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Course <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select className="form-select" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                      <option value="">Select course</option>
                      {courseList.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <textarea className="form-control" rows={4} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Explain why you missed the exam…" />
                  </div>
                </div>
              </div>
              <div className="modal-box__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationsPage>
  );
}

/* ─────────────────────────────────────────────────
   CLEARANCE
───────────────────────────────────────────────── */
export function ClearanceList() {
  const { flash } = useFlash();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ clearance_type: '', remarks: '' });

  const CLEARANCE_TYPES = [
    'graduation', 'fees', 'library', 'hostel', 'academic', 'general',
  ];

  async function load() {
    try {
      const profileRes = await students.myProfile();
      setProfile(profileRes.data);
      const res = await clearances.list({ student: profileRes.data.id });
      setData(res.data.results ?? res.data);
    } catch {
      flash('Could not load clearance requests.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clearance_type) { flash('Clearance type is required.', 'warning'); return; }
    setSaving(true);
    try {
      await clearances.create({ student: profile.id, clearance_type: form.clearance_type, remarks: form.remarks });
      flash('Clearance request submitted.', 'success');
      setModal(false);
      setForm({ clearance_type: '', remarks: '' });
      load();
    } catch (err) {
      flash(err.response?.data?.detail || 'Submission failed.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationsPage
      title="Clearance Requests"
      subtitle="Request clearance certificates"
      data={data}
      loading={loading}
      onAdd={() => setModal(true)}
      columns={['Type', 'Remarks', 'Date', 'Status']}
      renderRow={d => (
        <tr key={d.id}>
          <td style={{ textTransform: 'capitalize' }}>{d.clearance_type?.replace('_', ' ')}</td>
          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.remarks || '—'}</td>
          <td>{d.request_date ? new Date(d.request_date).toLocaleDateString('en-KE') : '—'}</td>
          <td><StatusBadge status={d.status} /></td>
        </tr>
      )}
    >
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-box__header">
              <h5>Request Clearance</h5>
              <button className="modal-close" onClick={() => setModal(false)}><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-box__body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Clearance Type <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select className="form-select" value={form.clearance_type} onChange={e => setForm(f => ({ ...f, clearance_type: e.target.value }))}>
                      <option value="">Select type</option>
                      {CLEARANCE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-control" rows={3} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Additional comments…" />
                  </div>
                </div>
              </div>
              <div className="modal-box__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationsPage>
  );
}

/* ─────────────────────────────────────────────────
   Shared layout wrapper
───────────────────────────────────────────────── */
function ApplicationsPage({ title, subtitle, data, loading, onAdd, columns, renderRow, children }) {
  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">{title}</li>
        </ol>
      </nav>
      <div className="page-header">
        <div><h1 className="page-header__title">{title}</h1><p className="page-header__sub">{subtitle}</p></div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            <i className="ri-add-line" /> New Application
          </button>
        </div>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total', value: data.length, color: 'primary', icon: 'ri-file-list-line' },
          { label: 'Pending', value: data.filter(d => d.status === 'pending').length, color: 'warning', icon: 'ri-time-line' },
          { label: 'Approved', value: data.filter(d => d.status === 'approved').length, color: 'success', icon: 'ri-checkbox-circle-line' },
          { label: 'Rejected', value: data.filter(d => d.status === 'rejected').length, color: 'danger', icon: 'ri-close-circle-line' },
        ].map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-card__icon stat-card__icon--${color}`}><i className={icon} /></div>
            <div className="stat-card__body"><div className="stat-card__value">{value}</div><div className="stat-card__label">{label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><h5>{title}</h5></div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading…</div>
          ) : data.length === 0 ? (
            <div className="empty-state"><i className="ri-file-search-line" /><p>No applications found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{data.map(d => renderRow(d))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default DefermentList;
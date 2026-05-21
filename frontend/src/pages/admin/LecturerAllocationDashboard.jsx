import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lecturers, courses, semesters, academicYears, departments } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function AllocationModal({ assignment, lecturerList, courseList, semesterList, yearList, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(assignment?.id);
  const [form, setForm] = useState({
    lecturer:      assignment?.lecturer      || '',
    course:        assignment?.course        || '',
    semester:      assignment?.semester      || '',
    academic_year: assignment?.academic_year || '',
    hours_per_week:assignment?.hours_per_week|| '',
    venue:         assignment?.venue         || '',
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      isEdit
        ? await lecturers.assignmentUpdate(assignment.id, form)
        : await lecturers.assignmentCreate(form);
      flash(`Allocation ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save allocation.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Allocation' : 'Allocate Course to Lecturer'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Lecturer *</label>
                <select className="form-select" name="lecturer" value={form.lecturer} onChange={handleChange} required>
                  <option value="">Select lecturer</option>
                  {lecturerList.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.employee_number})</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Course *</label>
                <select className="form-select" name="course" value={form.course} onChange={handleChange} required>
                  <option value="">Select course</option>
                  {courseList.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Academic Year *</label>
                <select className="form-select" name="academic_year" value={form.academic_year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  {yearList.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Semester *</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange} required>
                  <option value="">Select semester</option>
                  {semesterList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Hours Per Week</label>
                <input type="number" className="form-control" name="hours_per_week" value={form.hours_per_week} onChange={handleChange} placeholder="e.g. 3" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Venue</label>
                <input className="form-control" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. LT 3" />
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : 'Save Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LecturerAllocationDashboard() {
  const { flash } = useFlash();
  const [assignments, setAssignments] = useState([]);
  const [lecList,     setLecList]     = useState([]);
  const [courseList,  setCourseList]  = useState([]);
  const [semList,     setSemList]     = useState([]);
  const [yearList,    setYearList]    = useState([]);
  const [deptList,    setDeptList]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [filterLec,   setFilterLec]   = useState('');
  const [filterSem,   setFilterSem]   = useState('');

  async function load() {
    setLoading(true);
    try {
      const [aRes, lRes, cRes, sRes, yRes, dRes] = await Promise.all([
        lecturers.assignmentList({ lecturer: filterLec, semester: filterSem }),
        lecturers.list(),
        courses.list(),
        semesters.list(),
        academicYears.list(),
        departments.list(),
      ]);
      setAssignments(aRes.data.results ?? aRes.data);
      setLecList(lRes.data.results ?? lRes.data);
      setCourseList(cRes.data.results ?? cRes.data);
      setSemList(sRes.data.results ?? sRes.data);
      setYearList(yRes.data.results ?? yRes.data);
      setDeptList(dRes.data.results ?? dRes.data);
    } catch { flash('Failed to load allocations.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterLec, filterSem]);

  async function deleteAllocation(id) {
    if (!window.confirm('Remove this course allocation?')) return;
    try { await lecturers.assignmentDelete(id); flash('Removed.', 'success'); load(); }
    catch { flash('Cannot remove.', 'danger'); }
  }

  const q = search.toLowerCase();
  const filtered = assignments.filter(a =>
    !q || a.lecturer_name?.toLowerCase().includes(q) || a.course_code?.toLowerCase().includes(q) || a.course_name?.toLowerCase().includes(a)
  );

  // Summary per lecturer
  const byLecturer = lecList.map(l => ({
    ...l,
    units: assignments.filter(a => a.lecturer === l.id).length,
  })).filter(l => l.units > 0).sort((a, b) => b.units - a.units);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Lecturer Allocations</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Lecturer Allocation Dashboard</h1>
          <p className="page-header__sub">Assign courses to lecturers per semester</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Allocate Course
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Allocations', value: assignments.length, color: 'primary', icon: 'ri-links-line' },
          { label: 'Lecturers Assigned', value: byLecturer.length, color: 'success', icon: 'ri-user-star-line' },
          { label: 'Unassigned Lecturers', value: lecList.length - byLecturer.length, color: 'warning', icon: 'ri-user-unfollow-line' },
          { label: 'Courses Covered', value: [...new Set(assignments.map(a => a.course))].length, color: 'info', icon: 'ri-book-open-line' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

        {/* Lecturer workload summary */}
        <div className="card">
          <div className="card-header"><h5><i className="ri-bar-chart-horizontal-line" /> Workload Summary</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {byLecturer.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}><i className="ri-user-star-line" /><p>No assignments yet.</p></div>
            ) : (
              <table className="table">
                <thead><tr><th>Lecturer</th><th>Units</th></tr></thead>
                <tbody>
                  {byLecturer.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 12 }}>{l.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.academic_rank}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                            <div style={{ width: `${Math.min((l.units / 8) * 100, 100)}%`, height: '100%', background: l.units > 6 ? 'var(--danger)' : l.units > 4 ? 'var(--warning)' : 'var(--success)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{l.units}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Allocations table */}
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-links-line" /> Allocations</h5>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginLeft: 'auto' }}>
              <div className="search-bar">
                <i className="ri-search-line" />
                <input className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 160 }} value={filterLec} onChange={e => setFilterLec(e.target.value)}>
                <option value="">All Lecturers</option>
                {lecList.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
              <select className="form-select" style={{ width: 140 }} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                <option value="">All Semesters</option>
                {semList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-block"><span className="spinner" /> Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state"><i className="ri-links-line" /><p>No allocations found.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Lecturer</th>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Hrs/Week</th>
                      <th>Venue</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.lecturer_name}</td>
                        <td>
                          <div style={{ fontSize: 12, fontFamily: 'monospace' }}>{a.course_code}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.course_name}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{a.semester_display}</td>
                        <td>{a.hours_per_week || '—'}</td>
                        <td style={{ fontSize: 12 }}>{a.venue || '—'}</td>
                        <td>
                          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn-icon" onClick={() => setModal(a)}><i className="ri-pencil-line" /></button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteAllocation(a.id)}><i className="ri-delete-bin-line" /></button>
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
      </div>

      {modal && (
        <AllocationModal
          assignment={modal === 'add' ? null : modal}
          lecturerList={lecList}
          courseList={courseList}
          semesterList={semList}
          yearList={yearList}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
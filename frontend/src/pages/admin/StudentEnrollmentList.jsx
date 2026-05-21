import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollments, students, courses, semesters, lecturers } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function EnrollmentModal({ enrollment, studentList, courseList, semesterList, lecturerList, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(enrollment?.id);
  const [form, setForm] = useState({
    student:  enrollment?.student  || '',
    course:   enrollment?.course   || '',
    semester: enrollment?.semester || '',
    lecturer: enrollment?.lecturer || '',
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.student || !form.course || !form.semester) return;
    setSaving(true);
    try {
      isEdit ? await enrollments.update(enrollment.id, form) : await enrollments.create(form);
      flash(`Enrollment ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save enrollment.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Enrollment' : 'Enroll Student'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Student *</label>
                <select className="form-select" name="student" value={form.student} onChange={handleChange} required>
                  <option value="">Select student</option>
                  {studentList.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Course *</label>
                <select className="form-select" name="course" value={form.course} onChange={handleChange} required>
                  <option value="">Select course</option>
                  {courseList.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Semester *</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange} required>
                  <option value="">Select semester</option>
                  {semesterList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Lecturer</label>
                <select className="form-select" name="lecturer" value={form.lecturer} onChange={handleChange}>
                  <option value="">Select lecturer</option>
                  {lecturerList.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : isEdit ? 'Update' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentEnrollmentList() {
  const { flash } = useFlash();
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [studentList,    setStudentList]    = useState([]);
  const [courseList,     setCourseList]     = useState([]);
  const [semesterList,   setSemesterList]   = useState([]);
  const [lecturerList,   setLecturerList]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [currentPage, setPage]   = useState(1);
  const PER_PAGE = 20;

  async function load() {
    setLoading(true);
    try {
      const [eRes, sRes, cRes, semRes, lRes] = await Promise.all([
        enrollments.list({ semester: filterSem }),
        students.list(),
        courses.list(),
        semesters.list(),
        lecturers.list(),
      ]);
      setEnrollmentList(eRes.data.results ?? eRes.data);
      setStudentList(sRes.data.results ?? sRes.data);
      setCourseList(cRes.data.results ?? cRes.data);
      setSemesterList(semRes.data.results ?? semRes.data);
      setLecturerList(lRes.data.results ?? lRes.data);
    } catch { flash('Failed to load enrollments.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterSem]);
  useEffect(() => { setPage(1); }, [search, filterSem]);

  async function deleteEnrollment(id) {
    if (!window.confirm('Remove this enrollment?')) return;
    try { await enrollments.delete(id); flash('Enrollment removed.', 'success'); load(); }
    catch { flash('Cannot remove enrollment.', 'danger'); }
  }

  const q = search.toLowerCase();
  const filtered = enrollmentList.filter(e =>
    !q || e.student_name?.toLowerCase().includes(q) || e.course_code?.toLowerCase().includes(q) || e.course_name?.toLowerCase().includes(q)
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Enrollments</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Student Enrollments</h1>
          <p className="page-header__sub">Manage course enrollments for all students</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Enroll Student
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Enrollments', value: enrollmentList.length, color: 'primary', icon: 'ri-list-check' },
          { label: 'Unique Students',   value: [...new Set(enrollmentList.map(e => e.student))].length, color: 'success', icon: 'ri-group-line' },
          { label: 'Unique Courses',    value: [...new Set(enrollmentList.map(e => e.course))].length,  color: 'info',    icon: 'ri-book-open-line' },
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
          <h5><i className="ri-list-check" /> Enrollments</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Student, course…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
              <option value="">All Semesters</option>
              {semesterList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
            </select>
            {(search || filterSem) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setSearch(''); setFilterSem(''); }}>
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state"><i className="ri-list-check" /><p>No enrollments found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Lecturer</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((e, idx) => (
                    <tr key={e.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{e.student_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{e.course_code}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.course_name}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{e.semester_display}</td>
                      <td style={{ fontSize: 12 }}>{e.lecturer_name || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setModal(e)}><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteEnrollment(e.id)}><i className="ri-delete-bin-line" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="card-footer flex items-center justify-between">
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
        <EnrollmentModal
          enrollment={modal === 'add' ? null : modal}
          studentList={studentList}
          courseList={courseList}
          semesterList={semesterList}
          lecturerList={lecturerList}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
/**
 * pages/student/Grades.jsx
 * Shows all grades grouped by semester with GPA summary.
 */

import { useState, useEffect } from 'react';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function GradeBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32 }}>{value ?? '—'}</span>
    </div>
  );
}

export default function StudentGrades() {
  const { flash } = useFlash();
  const [profile,  setProfile]  = useState(null);
  const [allGrades, setGrades]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [semester, setSemester] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await students.myProfile();
        setProfile(profileRes.data);
        const gradesRes = await students.grades(profileRes.data.id);
        setGrades(gradesRes.data.results ?? gradesRes.data);
      } catch {
        flash('Could not load grades.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group by semester
  const grouped = allGrades.reduce((acc, g) => {
    const key = g.semester || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});

  const semesters = Object.keys(grouped);
  const displayed = semester ? { [semester]: grouped[semester] } : grouped;

  // GPA per semester
  function semGPA(grades) {
    const valid = grades.filter(g => g.grade_points != null);
    if (!valid.length) return null;
    const totalQP = valid.reduce((s, g) => s + (g.quality_points ?? 0), 0);
    const totalCH = valid.reduce((s, g) => s + (g.credit_hours ?? 0), 0);
    return totalCH ? (totalQP / totalCH).toFixed(2) : null;
  }

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading grades…</div></div>;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Grades</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">My Grades</h1>
          <p className="page-header__sub">Academic performance record</p>
        </div>
        <div className="page-header__actions">
          <a href="/student/transcript" className="btn btn-secondary btn-sm">
            <i className="ri-file-text-line" /> View Transcript
          </a>
        </div>
      </div>

      {/* GPA summary */}
      <div className="stats-grid">
        {[
          { label: 'Cumulative GPA', value: profile?.cumulative_gpa != null ? Number(profile.cumulative_gpa).toFixed(2) : '—', icon: 'ri-bar-chart-2-line', color: 'primary' },
          { label: 'Courses Taken',  value: allGrades.length, icon: 'ri-book-open-line', color: 'info' },
          { label: 'Passed',         value: allGrades.filter(g => g.is_passed).length, icon: 'ri-checkbox-circle-line', color: 'success' },
          { label: 'Failed/Pending', value: allGrades.filter(g => !g.is_passed).length, icon: 'ri-close-circle-line', color: 'danger' },
        ].map(({ label, value, icon, color }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-card__icon stat-card__icon--${color}`}><i className={icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select className="form-select" style={{ width: 220 }} value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Per-semester grade tables */}
      {Object.entries(displayed).length === 0 ? (
        <div className="card"><div className="empty-state"><i className="ri-bar-chart-line" /><p>No grades recorded yet.</p></div></div>
      ) : (
        Object.entries(displayed).map(([sem, semGrades]) => (
          <div className="card" key={sem} style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h5><i className="ri-calendar-line" style={{ marginRight: 6 }} />{sem}</h5>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                Semester GPA: <strong style={{ color: 'var(--text)' }}>{semGPA(semGrades) ?? '—'}</strong>
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Code</th>
                      <th>CA</th>
                      <th>Exam</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Grade Pts</th>
                      <th>Marks Bar</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semGrades.map(g => (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 500 }}>{g.course_name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.course_code}</td>
                        <td>{g.continuous_assessment ?? '—'}</td>
                        <td>{g.final_exam ?? '—'}</td>
                        <td style={{ fontWeight: 600 }}>{g.total_marks ?? '—'}</td>
                        <td>
                          <span style={{
                            fontWeight: 700, fontSize: 15,
                            color: g.is_passed ? 'var(--success)' : 'var(--danger)',
                          }}>{g.grade ?? '—'}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{g.grade_points ?? '—'}</td>
                        <td style={{ minWidth: 120 }}><GradeBar value={g.total_marks} /></td>
                        <td>
                          <span className={`badge ${g.is_passed ? 'badge-success' : g.grade ? 'badge-danger' : 'badge-gray'}`}>
                            {g.grade ? (g.is_passed ? 'Pass' : 'Fail') : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
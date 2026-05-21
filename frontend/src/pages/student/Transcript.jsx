/**
 * pages/student/Transcript.jsx
 * Official transcript view — grouped by semester, printable.
 */

import { useState, useEffect } from 'react';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function Transcript() {
  const { flash } = useFlash();
  const [transcript, setTranscript] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await students.myProfile();
        const res = await students.transcript(profileRes.data.id);
        setTranscript(res.data);
      } catch {
        flash('Could not load transcript.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading transcript…</div></div>;
  if (!transcript) return null;

  // Group courses by semester
  const bySemester = (transcript.courses || []).reduce((acc, c) => {
    const key = `${c.academic_year} — ${c.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Transcript</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Academic Transcript</h1>
          <p className="page-header__sub">Official academic record</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <i className="ri-printer-line" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Header info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="row g-3">
            {[
              ['Student Name',    transcript.student_name],
              ['Student ID',      transcript.student_id],
              ['Programme',       transcript.programme],
              ['Admission Date',  transcript.admission_date],
              ['Current Year',    `Year ${transcript.current_year}`],
              ['Cumulative GPA',  transcript.cumulative_gpa != null ? Number(transcript.cumulative_gpa).toFixed(2) : '—'],
              ['Total Credit Hrs', transcript.total_credit_hours],
            ].map(([label, value]) => (
              <div className="col-md-3 col-sm-6" key={label}>
                <div className="info-row">
                  <span className="info-row__label">{label}</span>
                  <span className="info-row__value" style={{ fontWeight: label === 'Cumulative GPA' ? 700 : 400, color: label === 'Cumulative GPA' ? 'var(--primary)' : undefined }}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-semester */}
      {Object.entries(bySemester).map(([semKey, courses]) => {
        const totalCH = courses.reduce((s, c) => s + (c.credit_hours || 0), 0);
        const totalQP = courses.reduce((s, c) => s + (c.quality_points || 0), 0);
        const semGPA  = totalCH ? (totalQP / totalCH).toFixed(2) : '—';

        return (
          <div className="card" key={semKey} style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h5 style={{ fontSize: 14 }}>{semKey}</h5>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                Semester GPA: <strong style={{ color: 'var(--text)' }}>{semGPA}</strong>
                &nbsp;·&nbsp;Credit Hrs: <strong style={{ color: 'var(--text)' }}>{totalCH}</strong>
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credit Hours</th>
                      <th>Grade</th>
                      <th>Grade Points</th>
                      <th>Quality Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.course_code}</td>
                        <td>{c.course_name}</td>
                        <td>{c.credit_hours}</td>
                        <td>
                          <span style={{
                            fontWeight: 700, fontSize: 15,
                            color: c.is_passed ? 'var(--success)' : 'var(--danger)',
                          }}>{c.grade || '—'}</span>
                        </td>
                        <td>{c.grade_points ?? '—'}</td>
                        <td>{c.quality_points ?? '—'}</td>
                        <td>
                          <span className={`badge ${c.is_passed ? 'badge-success' : c.grade ? 'badge-danger' : 'badge-gray'}`}>
                            {c.grade ? (c.is_passed ? 'Pass' : 'Fail') : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {Object.keys(bySemester).length === 0 && (
        <div className="card">
          <div className="empty-state">
            <i className="ri-file-text-line" />
            <p>No academic records found yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
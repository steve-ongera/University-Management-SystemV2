import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { students } from '../../../api/api';
import { useFlash } from '../../../components/FlashMessages';

export default function StudentTranscript() {
  const { id } = useParams();
  const { flash } = useFlash();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    students.transcript(id)
      .then(r => setTranscript(r.data))
      .catch(() => flash('Failed to load transcript.', 'danger'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-block" style={{ height: '60vh' }}><span className="spinner" /> Loading…</div>;
  if (!transcript) return <div className="empty-state"><i className="ri-file-text-line" /><p>Transcript not available.</p></div>;

  const bySem = (transcript.courses || []).reduce((acc, c) => {
    const key = `${c.academic_year} — ${c.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/students">Students</Link></li>
          <li className="breadcrumb-item active">Transcript</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Academic Transcript</h1>
          <p className="page-header__sub">{transcript.student_name} &mdash; {transcript.student_id}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <i className="ri-printer-line" /> Print
          </button>
          <Link to={`/admin/students/${id}`} className="btn btn-secondary btn-sm">
            <i className="ri-arrow-left-line" /> Back
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h5><i className="ri-information-line" /> Student Information</h5></div>
        <div className="card-body">
          <div className="detail-grid">
            <div>
              <div className="info-row"><span className="info-row__label">Student Name</span><span className="info-row__value">{transcript.student_name}</span></div>
              <div className="info-row"><span className="info-row__label">Student ID</span><span className="info-row__value" style={{ fontFamily: 'monospace' }}>{transcript.student_id}</span></div>
              <div className="info-row"><span className="info-row__label">Programme</span><span className="info-row__value">{transcript.programme}</span></div>
            </div>
            <div>
              <div className="info-row"><span className="info-row__label">Admission Date</span><span className="info-row__value">{transcript.admission_date}</span></div>
              <div className="info-row"><span className="info-row__label">Current Year</span><span className="info-row__value">Year {transcript.current_year}</span></div>
              <div className="info-row">
                <span className="info-row__label">Cumulative GPA</span>
                <span className="info-row__value"><strong style={{ color: 'var(--primary)', fontSize: 16 }}>{transcript.cumulative_gpa ?? '—'}</strong></span>
              </div>
              <div className="info-row"><span className="info-row__label">Total Credit Hours</span><span className="info-row__value">{transcript.total_credit_hours}</span></div>
            </div>
          </div>
        </div>
      </div>

      {Object.entries(bySem).map(([semLabel, courses]) => {
        const semCH = courses.reduce((s, c) => s + (c.credit_hours || 0), 0);
        const semQP = courses.reduce((s, c) => s + (c.quality_points || 0), 0);
        const semGPA = semCH ? (semQP / semCH).toFixed(2) : '—';

        return (
          <div key={semLabel} className="card">
            <div className="card-header">
              <h5><i className="ri-calendar-line" /> {semLabel}</h5>
              <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: 13 }}>Semester GPA: {semGPA}</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credit Hrs</th>
                      <th>Grade</th>
                      <th>Grade Points</th>
                      <th>Quality Points</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.course_code}</td>
                        <td>{c.course_name}</td>
                        <td>{c.credit_hours}</td>
                        <td><span className="badge badge-primary">{c.grade}</span></td>
                        <td>{c.grade_points}</td>
                        <td>{c.quality_points}</td>
                        <td><span className={`badge ${c.is_passed ? 'badge-success' : 'badge-danger'}`}>{c.is_passed ? 'Pass' : 'Fail'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg)', fontWeight: 600 }}>
                      <td colSpan={2}>Totals</td>
                      <td>{semCH}</td>
                      <td />
                      <td />
                      <td>{semQP.toFixed(2)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
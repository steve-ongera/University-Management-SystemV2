/**
 * pages/student/Attendance.jsx
 * Attendance summary per course with percentage bars and session history.
 */

import { useState, useEffect } from 'react';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';
import { Link } from 'react-router-dom';

function AttendanceBadge({ pct }) {
  if (pct >= 75) return <span className="badge badge-success">{pct}%</span>;
  if (pct >= 60) return <span className="badge badge-warning">{pct}%</span>;
  return <span className="badge badge-danger">{pct}%</span>;
}

export default function StudentAttendance() {
  const { flash } = useFlash();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await students.myProfile();
        const summaryRes = await students.attendanceSummary(profileRes.data.id);
        setSummary(summaryRes.data.results ?? summaryRes.data);
      } catch {
        flash('Could not load attendance.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overallPct = summary.length
    ? Math.round(summary.reduce((s, c) => s + c.attendance_percentage, 0) / summary.length)
    : 0;
  const atRisk = summary.filter(c => c.attendance_percentage < 75).length;

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading attendance…</div></div>;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Attendance</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Attendance</h1>
          <p className="page-header__sub">Your attendance summary for the current semester</p>
        </div>
        <div className="page-header__actions">
          <Link to="/student/attendance/history" className="btn btn-secondary btn-sm">
            <i className="ri-history-line" /> Full History
          </Link>
          <Link to="/student/attendance/scan" className="btn btn-primary btn-sm">
            <i className="ri-qr-code-line" /> Scan QR
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Overall Attendance', value: `${overallPct}%`, icon: 'ri-user-follow-line', color: overallPct >= 75 ? 'success' : 'warning' },
          { label: 'Courses Enrolled',   value: summary.length,   icon: 'ri-book-2-line',       color: 'primary' },
          { label: 'At Risk (< 75%)',    value: atRisk,           icon: 'ri-error-warning-line', color: atRisk > 0 ? 'danger' : 'success' },
          { label: 'Total Sessions',     value: summary.reduce((s, c) => s + c.total_sessions, 0), icon: 'ri-calendar-check-line', color: 'info' },
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

      {atRisk > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius)', background: '#fff3cd',
          border: '1px solid #ffc107', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10, color: '#856404',
        }}>
          <i className="ri-error-warning-fill" style={{ fontSize: 18 }} />
          <span>You have <strong>{atRisk}</strong> course{atRisk > 1 ? 's' : ''} below the 75% attendance threshold. You may be barred from sitting exams.</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-list-check-2" style={{ marginRight: 6 }} />Attendance by Course</h5>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {summary.length === 0 ? (
            <div className="empty-state">
              <i className="ri-calendar-line" />
              <p>No attendance records found for this semester.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Total Sessions</th>
                    <th>Attended</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Excused</th>
                    <th>Attendance %</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((c, i) => {
                    const pct = Math.round(c.attendance_percentage);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{c.course_name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.course_code}</td>
                        <td>{c.total_sessions}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{c.attended}</td>
                        <td style={{ color: 'var(--danger)' }}>{c.absent}</td>
                        <td style={{ color: 'var(--warning)' }}>{c.late}</td>
                        <td style={{ color: 'var(--info)' }}>{c.excused}</td>
                        <td><AttendanceBadge pct={pct} /></td>
                        <td style={{ minWidth: 130 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{
                                width: `${pct}%`, height: '100%', borderRadius: 4,
                                background: pct >= 75 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)',
                              }} />
                            </div>
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
      </div>
    </div>
  );
}
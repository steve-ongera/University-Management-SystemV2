import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { students } from '../../../api/api';
import { useFlash } from '../../../components/FlashMessages';

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className="info-row__value">{value || '—'}</span>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const { flash } = useFlash();
  const [student, setStudent] = useState(null);
  const [balance, setBalance] = useState(null);
  const [grades, setGrades]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    async function load() {
      try {
        const [sRes, bRes, gRes, aRes] = await Promise.all([
          students.get(id),
          students.balance(id),
          students.grades(id),
          students.attendanceSummary(id),
        ]);
        setStudent(sRes.data);
        setBalance(bRes.data);
        setGrades(gRes.data.results ?? gRes.data);
        setAttendance(aRes.data.results ?? aRes.data);
      } catch {
        flash('Failed to load student details.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="loading-block" style={{ height: '60vh' }}><span className="spinner" /> Loading…</div>;
  if (!student) return <div className="empty-state" style={{ height: '60vh' }}><i className="ri-user-search-line" /><p>Student not found.</p></div>;

  const u = student.user || {};
  const name = student.full_name || `${u.first_name} ${u.last_name}`;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/students">Students</Link></li>
          <li className="breadcrumb-item active">{name}</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">{name}</h1>
          <p className="page-header__sub">{student.student_id} &mdash; {student.programme_name}</p>
        </div>
        <div className="page-header__actions">
          <Link to={`/admin/students/${id}/performance`} className="btn btn-secondary btn-sm">
            <i className="ri-bar-chart-line" /> Performance
          </Link>
          <Link to={`/admin/students/${id}/transcript`} className="btn btn-secondary btn-sm">
            <i className="ri-file-text-line" /> Transcript
          </Link>
          <Link to="/admin/students" className="btn btn-secondary btn-sm">
            <i className="ri-arrow-left-line" /> Back
          </Link>
        </div>
      </div>

      {/* Balance cards */}
      {balance && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--warning"><i className="ri-money-dollar-circle-line" /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">KES {Number(balance.total_fees).toLocaleString()}</div>
              <div className="stat-card__label">Total Fees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--success"><i className="ri-bank-card-line" /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">KES {Number(balance.total_paid).toLocaleString()}</div>
              <div className="stat-card__label">Total Paid</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--danger"><i className="ri-error-warning-line" /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">KES {Number(balance.balance).toLocaleString()}</div>
              <div className="stat-card__label">Balance Due</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: -1 }}>
        {[
          { key: 'profile',    label: 'Profile',    icon: 'ri-user-line' },
          { key: 'grades',     label: 'Grades',     icon: 'ri-book-open-line' },
          { key: 'attendance', label: 'Attendance', icon: 'ri-calendar-check-line' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 'var(--font-size-base)' }}>
            <i className={t.icon} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="detail-grid">
          <div className="card">
            <div className="card-header"><h5><i className="ri-user-line" /> Personal Info</h5></div>
            <div className="card-body">
              <InfoRow label="Full Name"    value={name} />
              <InfoRow label="Email"        value={u.email} />
              <InfoRow label="Phone"        value={u.phone} />
              <InfoRow label="Gender"       value={u.gender} />
              <InfoRow label="Date of Birth" value={u.date_of_birth} />
              <InfoRow label="National ID"  value={u.national_id} />
              <InfoRow label="Address"      value={u.address} />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h5><i className="ri-graduation-cap-line" /> Academic Info</h5></div>
            <div className="card-body">
              <InfoRow label="Student ID"    value={student.student_id} />
              <InfoRow label="Programme"     value={student.programme_name} />
              <InfoRow label="Year"          value={`Year ${student.current_year}`} />
              <InfoRow label="Semester"      value={`Semester ${student.current_semester}`} />
              <InfoRow label="Status"        value={<span className={`badge badge-${student.status === 'active' ? 'success' : 'gray'}`}>{student.status}</span>} />
              <InfoRow label="Admission Date" value={student.admission_date} />
              <InfoRow label="GPA"           value={student.cumulative_gpa ?? '—'} />
            </div>
          </div>
        </div>
      )}

      {tab === 'grades' && (
        <div className="card">
          <div className="card-header"><h5><i className="ri-book-open-line" /> Grades</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {grades.length === 0 ? (
              <div className="empty-state"><i className="ri-book-open-line" /><p>No grades recorded.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>CA</th>
                      <th>Exam</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => (
                      <tr key={g.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{g.course_code}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.course_name}</div>
                        </td>
                        <td>{g.continuous_assessment ?? '—'}</td>
                        <td>{g.final_exam ?? '—'}</td>
                        <td><strong>{g.total_marks ?? '—'}</strong></td>
                        <td><span className="badge badge-primary">{g.grade ?? '—'}</span></td>
                        <td>{g.grade_points ?? '—'}</td>
                        <td>
                          <span className={`badge ${g.is_passed ? 'badge-success' : 'badge-danger'}`}>
                            {g.is_passed ? 'Pass' : 'Fail'}
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

      {tab === 'attendance' && (
        <div className="card">
          <div className="card-header"><h5><i className="ri-calendar-check-line" /> Attendance Summary</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {attendance.length === 0 ? (
              <div className="empty-state"><i className="ri-calendar-line" /><p>No attendance records.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Sessions</th>
                      <th>Attended</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{a.course_code}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.course_name}</div>
                        </td>
                        <td>{a.total_sessions}</td>
                        <td>{a.attended}</td>
                        <td>{a.absent}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                              <div style={{ width: `${a.attendance_percentage}%`, height: '100%', background: a.attendance_percentage >= 75 ? 'var(--success)' : 'var(--danger)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, minWidth: 36 }}>{a.attendance_percentage?.toFixed(1)}%</span>
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
      )}
    </div>
  );
}
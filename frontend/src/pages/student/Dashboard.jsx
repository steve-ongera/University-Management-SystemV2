/**
 * pages/student/Dashboard.jsx
 * Student home dashboard — KPI tiles, quick links, recent activity.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { students, fees, attendance, grades, notifications as notifApi, assignments } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { flash } = useFlash();

  const [profile,    setProfile]    = useState(null);
  const [balance,    setBalance]    = useState(null);
  const [recentGrades, setGrades]  = useState([]);
  const [notifs,     setNotifs]    = useState([]);
  const [dueAssignments, setDueAssignments] = useState([]);
  const [loading,    setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, notifsRes] = await Promise.all([
          students.myProfile(),
          notifApi.list({ type: 'student' }),
        ]);
        setProfile(profileRes.data);
        setNotifs((notifsRes.data.results ?? notifsRes.data).slice(0, 5));

        const [balRes, gradesRes, assignRes] = await Promise.all([
          students.balance(profileRes.data.id),
          students.grades(profileRes.data.id),
          assignments.list({ published: true }),
        ]);
        setBalance(balRes.data);
        setGrades((gradesRes.data.results ?? gradesRes.data).slice(0, 5));
        const allA = assignRes.data.results ?? assignRes.data;
        const now = new Date();
        setDueAssignments(
          allA
            .filter(a => new Date(a.due_date) >= now)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 4)
        );
      } catch {
        flash('Could not load dashboard data.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-block"><span className="spinner" /> Loading dashboard…</div>
      </div>
    );
  }

  const gpa = profile?.cumulative_gpa ?? '—';

  return (
    <div className="page-wrapper">

      {/* Welcome banner */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-header__title">
            {greeting()}, {profile?.user?.first_name || user?.first_name} 👋
          </h1>
          <p className="page-header__sub">
            {profile?.student_id} · {profile?.programme_name}
          </p>
        </div>
        <div className="page-header__actions">
          <Link to="/student/notifications" className="btn btn-secondary btn-sm">
            <i className="ri-notification-3-line" />
            {notifs.filter(n => !n.is_read).length > 0 && (
              <span style={{
                background: 'var(--danger)', color: '#fff',
                borderRadius: '50%', fontSize: 10, padding: '1px 5px', marginLeft: 4,
              }}>
                {notifs.filter(n => !n.is_read).length}
              </span>
            )}
            &nbsp;Notifications
          </Link>
          <Link to="/student/profile" className="btn btn-primary btn-sm">
            <i className="ri-user-line" /> My Profile
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary">
            <i className="ri-money-dollar-circle-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">
              {balance ? `KES ${Number(balance.balance).toLocaleString()}` : '—'}
            </div>
            <div className="stat-card__label">Fee Balance</div>
            {balance && Number(balance.balance) > 0 && (
              <div className="stat-card__delta stat-card__delta--down">
                <i className="ri-arrow-down-line" /> Outstanding
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">
            <i className="ri-bar-chart-2-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{typeof gpa === 'number' ? gpa.toFixed(2) : gpa}</div>
            <div className="stat-card__label">Cumulative GPA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning">
            <i className="ri-file-list-3-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{dueAssignments.length}</div>
            <div className="stat-card__label">Pending Assignments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info">
            <i className="ri-calendar-check-line" />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">Year {profile?.current_year ?? '—'}</div>
            <div className="stat-card__label">
              Sem {profile?.current_semester ?? '—'} · {profile?.status ?? ''}
            </div>
          </div>
        </div>
      </div>

      {/* Body: two-column */}
      <div className="row g-3">

        {/* Left — upcoming assignments */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-header">
              <h5><i className="ri-file-list-3-line" style={{ marginRight: 6 }} />Upcoming Assignments</h5>
              <Link to="/student/assignments" className="btn btn-sm btn-outline-primary" style={{ marginLeft: 'auto' }}>
                View all
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {dueAssignments.length === 0 ? (
                <div className="empty-state">
                  <i className="ri-checkbox-circle-line" />
                  <p>No upcoming assignments. You're all caught up!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Course</th>
                        <th>Due Date</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueAssignments.map(a => {
                        const due = new Date(a.due_date);
                        const daysLeft = Math.ceil((due - new Date()) / 86400000);
                        return (
                          <tr key={a.id}>
                            <td>
                              <Link to={`/student/assignments/${a.id}`} style={{ fontWeight: 500 }}>
                                {a.title}
                              </Link>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.course_code}</td>
                            <td>
                              <span style={{ color: daysLeft <= 2 ? 'var(--danger)' : 'inherit', fontWeight: daysLeft <= 2 ? 600 : 400 }}>
                                {due.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                              </span>
                              {' '}
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                ({daysLeft}d left)
                              </span>
                            </td>
                            <td>{a.total_marks ?? '—'}</td>
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

        {/* Right — recent grades + quick links */}
        <div className="col-md-5">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h5><i className="ri-award-line" style={{ marginRight: 6 }} />Recent Grades</h5>
              <Link to="/student/grades" className="btn btn-sm btn-outline-primary" style={{ marginLeft: 'auto' }}>
                View all
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentGrades.length === 0 ? (
                <div className="empty-state">
                  <i className="ri-bar-chart-line" />
                  <p>No grades recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr><th>Course</th><th>Grade</th><th>GPA pts</th></tr>
                    </thead>
                    <tbody>
                      {recentGrades.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontSize: 12 }}>{g.course_code}</td>
                          <td>
                            <span className={`badge ${g.is_passed ? 'badge-success' : 'badge-danger'}`}>
                              {g.grade}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{g.grade_points ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <div className="card-header"><h5><i className="ri-grid-line" style={{ marginRight: 6 }} />Quick Links</h5></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { to: '/student/fees',       icon: 'ri-money-dollar-circle-line', label: 'Pay Fees'    },
                  { to: '/student/timetable',  icon: 'ri-calendar-2-line',           label: 'Timetable'  },
                  { to: '/student/attendance', icon: 'ri-user-follow-line',          label: 'Attendance' },
                  { to: '/student/transcript', icon: 'ri-file-text-line',            label: 'Transcript' },
                  { to: '/student/library',    icon: 'ri-book-2-line',               label: 'Library'    },
                  { to: '/student/messages',   icon: 'ri-chat-3-line',               label: 'Messages'   },
                ].map(l => (
                  <Link key={l.to} to={l.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      borderRadius: 'var(--radius)', background: 'var(--bg-subtle)',
                      color: 'var(--text)', fontSize: 13, textDecoration: 'none',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  >
                    <i className={l.icon} style={{ color: 'var(--primary)', fontSize: 16 }} />
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
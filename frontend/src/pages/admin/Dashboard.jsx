import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analytics, students, fees, enrollments } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function AdminDashboard() {
  const { flash } = useFlash();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sRes] = await Promise.all([
          analytics.dashboard(),
          students.list({ ordering: '-id', page_size: 5 }),
        ]);
        setMetrics(mRes.data);
        setRecentStudents(sRes.data.results ?? sRes.data);
      } catch {
        flash('Failed to load dashboard data.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-block" style={{ height: '60vh' }}>
        <span className="spinner" /> Loading dashboard…
      </div>
    );
  }

  const m = metrics || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__sub">
            {m.current_academic_year} &mdash; {m.current_semester}
          </p>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary"><i className="ri-group-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.total_students ?? '—'}</div>
            <div className="stat-card__label">Total Students</div>
            <div className="stat-card__delta stat-card__delta--up">
              <i className="ri-checkbox-circle-line" /> {m.active_students} active
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-user-star-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.total_lecturers ?? '—'}</div>
            <div className="stat-card__label">Lecturers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><i className="ri-book-open-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.total_courses ?? '—'}</div>
            <div className="stat-card__label">Courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info"><i className="ri-building-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.total_departments ?? '—'}</div>
            <div className="stat-card__label">Departments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-money-dollar-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">
              {m.total_payments_this_semester != null
                ? `KES ${Number(m.total_payments_this_semester).toLocaleString()}`
                : '—'}
            </div>
            <div className="stat-card__label">Payments This Semester</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--danger"><i className="ri-file-list-3-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.pending_applications ?? '—'}</div>
            <div className="stat-card__label">Pending Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><i className="ri-home-8-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">
              {m.hostel_occupancy_rate != null ? `${m.hostel_occupancy_rate.toFixed(1)}%` : '—'}
            </div>
            <div className="stat-card__label">Hostel Occupancy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--danger"><i className="ri-book-2-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{m.overdue_library_books ?? '—'}</div>
            <div className="stat-card__label">Overdue Library Books</div>
          </div>
        </div>
      </div>

      {/* Quick links + recent students */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Quick links */}
        <div className="card">
          <div className="card-header"><h5><i className="ri-apps-line" /> Quick Actions</h5></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Add Student',      path: '/admin/students',       icon: 'ri-user-add-line',      color: 'primary' },
                { label: 'Manage Fees',      path: '/admin/fees',           icon: 'ri-money-dollar-circle-line', color: 'success' },
                { label: 'Timetable',        path: '/admin/timetable',      icon: 'ri-time-line',          color: 'warning' },
                { label: 'Notifications',    path: '/admin/notifications',  icon: 'ri-notification-line',  color: 'info' },
                { label: 'Reports',          path: '/admin/reports',        icon: 'ri-bar-chart-line',     color: 'primary' },
                { label: 'Hostels',          path: '/admin/hostels',        icon: 'ri-home-8-line',        color: 'danger' },
              ].map(q => (
                <Link key={q.path} to={q.path} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text)', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span className={`stat-card__icon stat-card__icon--${q.color}`} style={{ width: 32, height: 32, fontSize: 15 }}>
                    <i className={q.icon} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent students */}
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-group-line" /> Recent Students</h5>
            <Link to="/admin/students" className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>View All</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentStudents.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <i className="ri-user-search-line" />
                <p>No students found.</p>
              </div>
            ) : (
              <table className="table">
                <tbody>
                  {recentStudents.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="avatar-initials">
                            {(s.full_name || s.user?.first_name || '?')[0]}
                          </span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 12 }}>{s.full_name || `${s.user?.first_name} ${s.user?.last_name}`}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${s.status === 'active' ? 'success' : 'gray'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/students/${s.id}`} className="btn-icon"><i className="ri-eye-line" /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
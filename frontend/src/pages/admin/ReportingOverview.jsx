import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analytics, reports } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function ReportingOverview() {
  const { flash } = useFlash();
  const [metrics,  setMetrics]  = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, aRes] = await Promise.all([
          analytics.dashboard(),
          analytics.activityLog({ page_size: 10 }),
        ]);
        setMetrics(mRes.data);
        setActivity(aRes.data.results ?? aRes.data);
      } catch { flash('Failed to load overview.', 'danger'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const reportCards = [
    { label: 'Enrollment Report',   desc: 'Students enrolled per programme/semester',  path: '/admin/reports',  icon: 'ri-group-line',          color: 'primary' },
    { label: 'Performance Report',  desc: 'Grade distribution and pass rates',          path: '/admin/reports',  icon: 'ri-bar-chart-line',       color: 'success' },
    { label: 'Finance Report',      desc: 'Fee collections, outstanding balances',      path: '/admin/reports',  icon: 'ri-money-dollar-circle-line', color: 'warning' },
    { label: 'Workload Report',     desc: 'Lecturer teaching hours and allocation',     path: '/admin/reports',  icon: 'ri-user-star-line',       color: 'info' },
    { label: 'Hostel Occupancy',    desc: 'Bed allocation and payment status',          path: '/admin/hostels',  icon: 'ri-home-8-line',          color: 'danger' },
    { label: 'Library Report',      desc: 'Book transactions, overdue returns',         path: '/admin/reports',  icon: 'ri-book-2-line',          color: 'primary' },
    { label: 'Attendance Summary',  desc: 'Class attendance rates by course',           path: '/admin/reports',  icon: 'ri-calendar-check-line',  color: 'success' },
    { label: 'Applications Report', desc: 'Deferments, special exams, clearances',      path: '/admin/reports',  icon: 'ri-file-list-3-line',     color: 'warning' },
  ];

  if (loading) return <div className="loading-block" style={{ height: '60vh' }}><span className="spinner" /> Loading overview…</div>;

  const m = metrics || {};

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Reporting Overview</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Reporting Overview</h1>
          <p className="page-header__sub">University-wide analytics and reports — {m.current_academic_year}</p>
        </div>
        <div className="page-header__actions">
          <Link to="/admin/reports" className="btn btn-primary btn-sm">
            <i className="ri-file-list-3-line" /> View All Reports
          </Link>
        </div>
      </div>

      {/* Key metrics */}
      <div className="stats-grid">
        {[
          { label: 'Total Students',     value: m.total_students,     color: 'primary', icon: 'ri-group-line' },
          { label: 'Active Students',    value: m.active_students,    color: 'success', icon: 'ri-checkbox-circle-line' },
          { label: 'Total Lecturers',    value: m.total_lecturers,    color: 'info',    icon: 'ri-user-star-line' },
          { label: 'Total Programmes',   value: m.total_programmes,   color: 'warning', icon: 'ri-graduation-cap-line' },
          { label: 'Total Departments',  value: m.total_departments,  color: 'primary', icon: 'ri-building-line' },
          { label: 'Pending Applications', value: m.pending_applications, color: 'danger', icon: 'ri-file-list-3-line' },
          { label: 'Hostel Occupancy',   value: m.hostel_occupancy_rate != null ? `${m.hostel_occupancy_rate.toFixed(1)}%` : '—', color: 'warning', icon: 'ri-home-8-line' },
          { label: 'Overdue Books',      value: m.overdue_library_books, color: 'danger', icon: 'ri-book-2-line' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${s.color}`}><i className={s.icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{s.value ?? '—'}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payments KPI */}
      {m.total_payments_this_semester != null && (
        <div className="card card-success" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-card__icon stat-card__icon--success" style={{ width: 48, height: 48, fontSize: 22 }}><i className="ri-money-dollar-circle-line" /></div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
              KES {Number(m.total_payments_this_semester).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total fee payments this semester — {m.current_semester}</div>
          </div>
        </div>
      )}

      {/* Report quick-access cards */}
      <div>
        <div className="section-title">Available Reports</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {reportCards.map(r => (
            <Link key={r.label} to={r.path} style={{ textDecoration: 'none' }}>
              <div className={`card card-${r.color}`} style={{ padding: 16, cursor: 'pointer', transition: 'box-shadow var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`stat-card__icon stat-card__icon--${r.color}`} style={{ width: 36, height: 36, fontSize: 17 }}>
                    <i className={r.icon} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity log */}
      <div className="card">
        <div className="card-header"><h5><i className="ri-history-line" /> Recent Activity</h5></div>
        <div className="card-body" style={{ padding: 0 }}>
          {activity.length === 0 ? (
            <div className="empty-state"><i className="ri-history-line" /><p>No recent activity.</p></div>
          ) : (
            <table className="table">
              <thead><tr><th>User</th><th>Action</th><th>Description</th><th>Time</th></tr></thead>
              <tbody>
                {activity.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.user_name}</td>
                    <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{a.action}</span></td>
                    <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.timestamp ? new Date(a.timestamp).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
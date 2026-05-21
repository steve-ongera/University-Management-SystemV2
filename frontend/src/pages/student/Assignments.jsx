/**
 * pages/student/Assignments.jsx
 * Lists all assignments the student can see; allows viewing details and submitting.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { assignments } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function DueBadge({ dueDate }) {
  const due = new Date(dueDate);
  const now = new Date();
  const daysLeft = Math.ceil((due - now) / 86400000);
  if (daysLeft < 0) return <span className="badge badge-danger">Overdue</span>;
  if (daysLeft === 0) return <span className="badge badge-danger">Due today</span>;
  if (daysLeft <= 2) return <span className="badge badge-warning">{daysLeft}d left</span>;
  return <span className="badge badge-gray">{daysLeft}d left</span>;
}

export default function StudentAssignments() {
  const { flash } = useFlash();
  const [data,        setData]       = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [search,      setSearch]     = useState('');
  const [filter,      setFilter]     = useState('');   // upcoming | overdue | all
  const [currentPage, setPage]       = useState(1);
  const PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignments.list({ published: true, search });
      setData(res.data.results ?? res.data);
    } catch {
      flash('Could not load assignments.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, filter]);

  const now = new Date();
  const filtered = data.filter(a => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.course_code?.toLowerCase().includes(search.toLowerCase());
    const due = new Date(a.due_date);
    if (filter === 'upcoming') return matchSearch && due >= now;
    if (filter === 'overdue')  return matchSearch && due < now;
    return matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const total    = data.length;
  const upcoming = data.filter(a => new Date(a.due_date) >= now).length;
  const overdue  = data.filter(a => new Date(a.due_date) < now).length;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Assignments</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Assignments</h1>
          <p className="page-header__sub">All your assignments for this semester</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total',    value: total,    color: 'primary', icon: 'ri-file-list-3-line' },
          { label: 'Upcoming', value: upcoming, color: 'success', icon: 'ri-time-line' },
          { label: 'Overdue',  value: overdue,  color: 'danger',  icon: 'ri-alarm-warning-line' },
        ].map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-card__icon stat-card__icon--${color}`}><i className={icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-file-list-3-line" style={{ marginRight: 6 }} />All Assignments</h5>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search title or course…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>
            {(search || filter) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setSearch(''); setFilter(''); }}>
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading assignments…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state">
              <i className="ri-file-list-line" />
              <p>No assignments found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Total Marks</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((a, idx) => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{a.title}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.course_code}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.lecturer_name}</td>
                      <td>{a.total_marks}</td>
                      <td>
                        {new Date(a.due_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td><DueBadge dueDate={a.due_date} /></td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Link to={`/student/assignments/${a.id}`} className="btn-icon" title="View">
                            <i className="ri-eye-line" />
                          </Link>
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
          <div className="card-footer flex items-center justify-between flex-wrap gap-3">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}><i className="ri-arrow-left-s-line" /></button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}><i className="ri-arrow-right-s-line" /></button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
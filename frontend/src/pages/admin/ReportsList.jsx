import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reports, programmes, semesters, academicYears, departments } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function ReportsList() {
  const { flash } = useFlash();
  const [progList,  setProgList]  = useState([]);
  const [semList,   setSemList]   = useState([]);
  const [yearList,  setYearList]  = useState([]);
  const [deptList,  setDeptList]  = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [filters,   setFilters]   = useState({ programme: '', semester: '', academic_year: '', department: '' });

  useEffect(() => {
    Promise.all([programmes.list(), semesters.list(), academicYears.list(), departments.list()])
      .then(([p, s, y, d]) => {
        setProgList(p.data.results ?? p.data);
        setSemList(s.data.results ?? s.data);
        setYearList(y.data.results ?? y.data);
        setDeptList(d.data.results ?? d.data);
      })
      .catch(() => flash('Failed to load filter options.', 'danger'));
  }, []);

  async function runReport(type) {
    setReportType(type);
    setLoading(true);
    setReportData(null);
    try {
      let res;
      if (type === 'enrollment')  res = await reports.enrollment({ programme: filters.programme, semester: filters.semester });
      if (type === 'performance') res = await reports.performance({ programme: filters.programme, semester: filters.semester });
      if (type === 'workload')    res = await reports.workload({ department: filters.department, semester: filters.semester });
      if (type === 'finance')     res = await reports.finance({ academic_year: filters.academic_year });
      setReportData(res?.data);
    } catch { flash(`Failed to run ${type} report.`, 'danger'); }
    finally { setLoading(false); }
  }

  function handleFilter(e) {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  }

  const reportTypes = [
    { key: 'enrollment',  label: 'Enrollment Report',  icon: 'ri-group-line',             color: 'primary', desc: 'Students enrolled by programme and semester' },
    { key: 'performance', label: 'Performance Report', icon: 'ri-bar-chart-line',         color: 'success', desc: 'Grade distribution and pass/fail rates' },
    { key: 'workload',    label: 'Workload Report',    icon: 'ri-user-star-line',         color: 'info',    desc: 'Lecturer teaching loads by department' },
    { key: 'finance',     label: 'Finance Report',     icon: 'ri-money-dollar-circle-line', color: 'warning', desc: 'Fee collections and outstanding balances' },
  ];

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/reports-overview">Reports Overview</Link></li>
          <li className="breadcrumb-item active">Reports</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Reports</h1>
          <p className="page-header__sub">Generate and export institutional reports</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

        {/* Report selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Report type cards */}
          <div className="card">
            <div className="card-header"><h5><i className="ri-file-list-3-line" /> Report Type</h5></div>
            <div className="card-body" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {reportTypes.map(r => (
                <button key={r.key} onClick={() => runReport(r.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: reportType === r.key ? 'var(--primary-light)' : '#fff', color: reportType === r.key ? 'var(--primary)' : 'var(--text)', cursor: 'pointer', textAlign: 'left', transition: 'background var(--transition)', borderColor: reportType === r.key ? 'rgba(26,115,232,.3)' : 'var(--border)' }}>
                  <span className={`stat-card__icon stat-card__icon--${r.color}`} style={{ width: 32, height: 32, fontSize: 14 }}>
                    <i className={r.icon} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="card-header"><h5><i className="ri-filter-line" /> Filters</h5></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="form-label">Programme</label>
                <select className="form-select" name="programme" value={filters.programme} onChange={handleFilter}>
                  <option value="">All</option>
                  {progList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Semester</label>
                <select className="form-select" name="semester" value={filters.semester} onChange={handleFilter}>
                  <option value="">All</option>
                  {semList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Academic Year</label>
                <select className="form-select" name="academic_year" value={filters.academic_year} onChange={handleFilter}>
                  <option value="">All</option>
                  {yearList.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Department</label>
                <select className="form-select" name="department" value={filters.department} onChange={handleFilter}>
                  <option value="">All</option>
                  {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              {reportType && (
                <button className="btn btn-primary" onClick={() => runReport(reportType)}>
                  <i className="ri-refresh-line" /> Refresh Report
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Report output */}
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-file-chart-line" /> {reportType ? reportTypes.find(r => r.key === reportType)?.label : 'Select a report'}</h5>
            {reportData && (
              <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
                <i className="ri-printer-line" /> Print
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: reportData ? 0 : 16 }}>
            {!reportType ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <i className="ri-file-chart-line" />
                <p>Select a report type from the left panel to get started.</p>
              </div>
            ) : loading ? (
              <div className="loading-block" style={{ height: 300 }}><span className="spinner" /> Generating report…</div>
            ) : !reportData ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <i className="ri-error-warning-line" />
                <p>No data returned for the selected filters.</p>
              </div>
            ) : Array.isArray(reportData) ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>{reportData[0] && Object.keys(reportData[0]).map(k => <th key={k} style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</th>)}</tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j}>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                <pre style={{ fontSize: 12, background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departments, programmes, courses, faculties } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function AcademicManagement() {
  const { flash } = useFlash();
  const [tab, setTab] = useState('departments');
  const [depts,  setDepts]  = useState([]);
  const [progs,  setProgs]  = useState([]);
  const [courseList, setCourses] = useState([]);
  const [facList, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dRes, pRes, cRes, fRes] = await Promise.all([
          departments.list(), programmes.list(), courses.list(), faculties.list(),
        ]);
        setDepts(dRes.data.results ?? dRes.data);
        setProgs(pRes.data.results ?? pRes.data);
        setCourses(cRes.data.results ?? cRes.data);
        setFaculties(fRes.data.results ?? fRes.data);
      } catch {
        flash('Failed to load academic data.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tabs = [
    { key: 'departments', label: 'Departments', icon: 'ri-building-line', data: depts },
    { key: 'programmes',  label: 'Programmes',  icon: 'ri-graduation-cap-line', data: progs },
    { key: 'courses',     label: 'Courses',      icon: 'ri-book-open-line', data: courseList },
  ];

  const currentTab = tabs.find(t => t.key === tab);
  const q = search.toLowerCase();
  const filtered = (currentTab?.data || []).filter(d =>
    !q || d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q)
  );

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Academic Management</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Academic Management</h1>
          <p className="page-header__sub">Faculties, departments, programmes and courses</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary"><i className="ri-building-4-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{facList.length}</div>
            <div className="stat-card__label">Faculties</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info"><i className="ri-building-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{depts.length}</div>
            <div className="stat-card__label">Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-graduation-cap-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{progs.length}</div>
            <div className="stat-card__label">Programmes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><i className="ri-book-open-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{courseList.length}</div>
            <div className="stat-card__label">Courses</div>
          </div>
        </div>
      </div>

      {/* Faculties quick view */}
      {facList.length > 0 && (
        <div className="card">
          <div className="card-header"><h5><i className="ri-building-4-line" /> Faculties</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Name</th><th>Code</th><th>Dean</th><th>Departments</th></tr></thead>
                <tbody>
                  {facList.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500 }}>{f.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.code}</td>
                      <td>{f.dean_name || '—'}</td>
                      <td>{depts.filter(d => d.faculty === f.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab section */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: tab === t.key ? 'var(--primary)' : '#fff', color: tab === t.key ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                <i className={t.icon} /> {t.label} ({t.data.length})
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ marginLeft: 'auto' }}>
            <i className="ri-search-line" />
            <input className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="ri-search-line" /><p>No records found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    {tab === 'departments' && <><th>Faculty</th><th>HOD</th></>}
                    {tab === 'programmes'  && <><th>Department</th><th>Type</th><th>Duration</th></>}
                    {tab === 'courses'     && <><th>Department</th><th>Level</th><th>Credits</th></>}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.code}</td>
                      {tab === 'departments' && <><td>{item.faculty_name}</td><td>{item.hod_name || '—'}</td></>}
                      {tab === 'programmes'  && <><td>{item.department_name}</td><td><span className="badge badge-info">{item.programme_type}</span></td><td>{item.duration} yrs</td></>}
                      {tab === 'courses'     && <><td>{item.department_name}</td><td>Level {item.level}</td><td>{item.credit_hours}</td></>}
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" title="Edit"><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }}><i className="ri-delete-bin-line" /></button>
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
    </div>
  );
}
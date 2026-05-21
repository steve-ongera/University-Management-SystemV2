import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { academicYears, semesters } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function AcademicYearModal({ year, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(year?.id);
  const [form, setForm] = useState({
    year:       year?.year       || '',
    start_date: year?.start_date || '',
    end_date:   year?.end_date   || '',
    is_current: year?.is_current || false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.year) return;
    setSaving(true);
    try {
      isEdit ? await academicYears.update(year.id, form) : await academicYears.create(form);
      flash(`Academic year ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--sm">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Academic Year' : 'Add Academic Year'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Year Label *</label>
                <input className="form-control" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2024/2025" />
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input type="date" className="form-control" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input type="date" className="form-control" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_current} onChange={e => setForm(f => ({ ...f, is_current: e.target.checked }))} />
                <span style={{ fontSize: 13 }}>Set as current academic year</span>
              </label>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AcademicYearManagement() {
  const { flash } = useFlash();
  const [years, setYears] = useState([]);
  const [sems,  setSems]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [yRes, sRes] = await Promise.all([academicYears.list(), semesters.list()]);
      const yData = yRes.data.results ?? yRes.data;
      setYears(yData);
      setSems(sRes.data.results ?? sRes.data);
      setSelectedYear(prev => prev || yData.find(y => y.is_current)?.id || yData[0]?.id);
    } catch { flash('Failed to load.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function deleteYear(id) {
    if (!window.confirm('Delete this academic year?')) return;
    try { await academicYears.delete(id); flash('Deleted.', 'success'); load(); }
    catch { flash('Cannot delete — semesters may be linked.', 'danger'); }
  }

  const currentSems = sems.filter(s => s.academic_year === selectedYear);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Academic Years</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Academic Years & Semesters</h1>
          <p className="page-header__sub">Manage the academic calendar</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Add Academic Year
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Academic years */}
        <div className="card">
          <div className="card-header"><h5><i className="ri-calendar-line" /> Academic Years</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-block"><span className="spinner" /> Loading…</div>
            ) : years.length === 0 ? (
              <div className="empty-state"><i className="ri-calendar-line" /><p>No academic years.</p></div>
            ) : (
              <table className="table">
                <thead><tr><th>Year</th><th>Start</th><th>End</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {years.map(y => (
                    <tr key={y.id} style={{ background: y.id === selectedYear ? 'var(--primary-light)' : '' }}>
                      <td>
                        <button onClick={() => setSelectedYear(y.id)} style={{ background: 'none', border: 'none', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', fontSize: 13 }}>
                          {y.year}
                        </button>
                      </td>
                      <td style={{ fontSize: 12 }}>{y.start_date || '—'}</td>
                      <td style={{ fontSize: 12 }}>{y.end_date || '—'}</td>
                      <td>{y.is_current ? <span className="badge badge-success">Current</span> : <span className="badge badge-gray">Past</span>}</td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setModal(y)}><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteYear(y.id)}><i className="ri-delete-bin-line" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Semesters for selected year */}
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-time-line" /> Semesters</h5>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
              {years.find(y => y.id === selectedYear)?.year}
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {currentSems.length === 0 ? (
              <div className="empty-state"><i className="ri-time-line" /><p>No semesters found.</p></div>
            ) : (
              <table className="table">
                <thead><tr><th>Semester</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                <tbody>
                  {currentSems.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.__str__ || `Semester ${s.semester_number}`}</td>
                      <td style={{ fontSize: 12 }}>{s.start_date || '—'}</td>
                      <td style={{ fontSize: 12 }}>{s.end_date || '—'}</td>
                      <td>{s.is_current ? <span className="badge badge-success">Current</span> : <span className="badge badge-gray">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <AcademicYearModal
          year={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
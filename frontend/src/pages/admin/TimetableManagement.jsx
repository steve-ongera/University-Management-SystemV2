import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timetable, programmes, semesters, lecturers, courses } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TimetableModal({ slot, programmes, semesters, lecturers, courses, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(slot?.id);
  const [form, setForm] = useState({
    programme:  slot?.programme  || '',
    semester:   slot?.semester   || '',
    course:     slot?.course     || '',
    lecturer:   slot?.lecturer   || '',
    day:        slot?.day        || 'Monday',
    start_time: slot?.start_time || '',
    end_time:   slot?.end_time   || '',
    venue:      slot?.venue      || '',
    year:       slot?.year       || 1,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      isEdit ? await timetable.update(slot.id, form) : await timetable.create(form);
      flash(`Timetable slot ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Programme *</label>
                <select className="form-select" name="programme" value={form.programme} onChange={handleChange} required>
                  <option value="">Select programme</option>
                  {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Semester *</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange} required>
                  <option value="">Select semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Semester ${s.semester_number}`}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Course *</label>
                <select className="form-select" name="course" value={form.course} onChange={handleChange} required>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Lecturer *</label>
                <select className="form-select" name="lecturer" value={form.lecturer} onChange={handleChange} required>
                  <option value="">Select lecturer</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Day</label>
                <select className="form-select" name="day" value={form.day} onChange={handleChange}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Start Time</label>
                <input type="time" className="form-control" name="start_time" value={form.start_time} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">End Time</label>
                <input type="time" className="form-control" name="end_time" value={form.end_time} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Venue / Room</label>
                <input className="form-control" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Room 101, Block A" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Year of Study</label>
                <select className="form-select" name="year" value={form.year} onChange={handleChange}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : 'Save Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TimetableManagement() {
  const { flash } = useFlash();
  const [slots,     setSlots]     = useState([]);
  const [progList,  setProgList]  = useState([]);
  const [semList,   setSemList]   = useState([]);
  const [lecList,   setLecList]   = useState([]);
  const [courseList,setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [viewMode,  setViewMode]  = useState('list');   // 'list' | 'grid'
  const [filterProg, setFilterProg] = useState('');
  const [filterSem,  setFilterSem]  = useState('');
  const [filterDay,  setFilterDay]  = useState('');

  async function load() {
    setLoading(true);
    try {
      const [tRes, pRes, sRes, lRes, cRes] = await Promise.all([
        timetable.list({ programme: filterProg, semester: filterSem, day: filterDay }),
        programmes.list(),
        semesters.list(),
        lecturers.list(),
        courses.list(),
      ]);
      setSlots(tRes.data.results ?? tRes.data);
      setProgList(pRes.data.results ?? pRes.data);
      setSemList(sRes.data.results ?? sRes.data);
      setLecList(lRes.data.results ?? lRes.data);
      setCourses(cRes.data.results ?? cRes.data);
    } catch { flash('Failed to load timetable.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterProg, filterSem, filterDay]);

  async function deleteSlot(id) {
    if (!window.confirm('Delete this timetable slot?')) return;
    try { await timetable.delete(id); flash('Slot deleted.', 'success'); load(); }
    catch { flash('Cannot delete slot.', 'danger'); }
  }

  // Group by day for grid view
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.day === d).sort((a, b) => a.start_time?.localeCompare(b.start_time));
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Timetable</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Timetable Management</h1>
          <p className="page-header__sub">Manage weekly class schedules</p>
        </div>
        <div className="page-header__actions">
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '5px 10px', border: 'none', background: viewMode === 'list' ? 'var(--primary)' : '#fff', color: viewMode === 'list' ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
              <i className="ri-list-unordered" />
            </button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '5px 10px', border: 'none', background: viewMode === 'grid' ? 'var(--primary)' : '#fff', color: viewMode === 'grid' ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
              <i className="ri-layout-grid-line" />
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Add Slot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h5><i className="ri-filter-line" /> Filters</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <select className="form-select" style={{ width: 180 }} value={filterProg} onChange={e => setFilterProg(e.target.value)}>
              <option value="">All Programmes</option>
              {progList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 160 }} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
              <option value="">All Semesters</option>
              {semList.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Sem ${s.semester_number}`}</option>)}
            </select>
            <select className="form-select" style={{ width: 130 }} value={filterDay} onChange={e => setFilterDay(e.target.value)}>
              <option value="">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {(filterProg || filterSem || filterDay) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setFilterProg(''); setFilterSem(''); setFilterDay(''); }}>
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-block" style={{ height: 200 }}><span className="spinner" /> Loading timetable…</div>
      ) : viewMode === 'list' ? (
        <div className="card">
          <div className="card-header"><h5><i className="ri-time-line" /> All Slots ({slots.length})</h5></div>
          <div className="card-body" style={{ padding: 0 }}>
            {slots.length === 0 ? (
              <div className="empty-state"><i className="ri-time-line" /><p>No timetable slots found.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Programme</th>
                      <th>Year</th>
                      <th>Venue</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(s => (
                      <tr key={s.id}>
                        <td><span className="badge badge-primary">{s.day}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.start_time} – {s.end_time}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{s.course_code}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.course_name}</div>
                        </td>
                        <td>{s.lecturer_name}</td>
                        <td>{s.programme_name}</td>
                        <td>Yr {s.year}</td>
                        <td>{s.venue || '—'}</td>
                        <td>
                          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn-icon" onClick={() => setModal(s)}><i className="ri-pencil-line" /></button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteSlot(s.id)}><i className="ri-delete-bin-line" /></button>
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
      ) : (
        /* Grid / weekly view */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {DAYS.map(day => (
            <div key={day} className="card">
              <div className="card-header" style={{ padding: '8px 12px' }}>
                <h5 style={{ fontSize: 13 }}>{day}</h5>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{byDay[day].length} slots</span>
              </div>
              <div className="card-body" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {byDay[day].length === 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No classes</p>
                ) : byDay[day].map(s => (
                  <div key={s.id} style={{ background: 'var(--primary-light)', border: '1px solid rgba(26,115,232,.2)', borderRadius: 'var(--radius-sm)', padding: '6px 8px' }}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--primary)' }}>{s.start_time} – {s.end_time}</div>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{s.course_code}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.venue}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <button className="btn-icon" style={{ width: 20, height: 20, fontSize: 12 }} onClick={() => setModal(s)}><i className="ri-pencil-line" /></button>
                      <button className="btn-icon" style={{ width: 20, height: 20, fontSize: 12, color: 'var(--danger)' }} onClick={() => deleteSlot(s.id)}><i className="ri-delete-bin-line" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TimetableModal
          slot={modal === 'add' ? null : modal}
          programmes={progList}
          semesters={semList}
          lecturers={lecList}
          courses={courseList}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
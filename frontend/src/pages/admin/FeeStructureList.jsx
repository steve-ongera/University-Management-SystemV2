import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fees, programmes, academicYears } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function FeeModal({ fee, programmes, academicYears, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(fee?.id);
  const [form, setForm] = useState({
    programme:        fee?.programme        || '',
    academic_year:    fee?.academic_year    || '',
    year:             fee?.year             || 1,
    semester:         fee?.semester         || 1,
    tuition_fee:      fee?.tuition_fee      || '',
    exam_fee:         fee?.exam_fee         || '',
    registration_fee: fee?.registration_fee || '',
    caution_fee:      fee?.caution_fee      || '',
    activity_fee:     fee?.activity_fee     || '',
    medical_fee:      fee?.medical_fee      || '',
    library_fee:      fee?.library_fee      || '',
    accommodation_fee:fee?.accommodation_fee|| '',
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
      isEdit ? await fees.structureUpdate(fee.id, form) : await fees.structureCreate(form);
      flash(`Fee structure ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save.', 'danger'); }
    finally { setSaving(false); }
  }

  const feeFields = [
    { name: 'tuition_fee',       label: 'Tuition Fee' },
    { name: 'exam_fee',          label: 'Exam Fee' },
    { name: 'registration_fee',  label: 'Registration Fee' },
    { name: 'caution_fee',       label: 'Caution Fee' },
    { name: 'activity_fee',      label: 'Activity Fee' },
    { name: 'medical_fee',       label: 'Medical Fee' },
    { name: 'library_fee',       label: 'Library Fee' },
    { name: 'accommodation_fee', label: 'Accommodation Fee' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Fee Structure' : 'Add Fee Structure'}</h5>
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
                <label className="form-label">Academic Year *</label>
                <select className="form-select" name="academic_year" value={form.academic_year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Study Year</label>
                <select className="form-select" name="year" value={form.year} onChange={handleChange}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Semester</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange}>
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              {feeFields.map(f => (
                <div key={f.name} className="col-md-6">
                  <label className="form-label">{f.label} (KES)</label>
                  <input type="number" className="form-control" name={f.name} value={form[f.name]} onChange={handleChange} placeholder="0.00" />
                </div>
              ))}
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

export default function FeeStructureList() {
  const { flash } = useFlash();
  const [structures, setStructures] = useState([]);
  const [progList, setProgList]     = useState([]);
  const [yearList, setYearList]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [filterProg, setFilterProg] = useState('');
  const [filterYear, setFilterYear] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [fRes, pRes, yRes] = await Promise.all([
        fees.structureList({ programme: filterProg, academic_year: filterYear }),
        programmes.list(),
        academicYears.list(),
      ]);
      setStructures(fRes.data.results ?? fRes.data);
      setProgList(pRes.data.results ?? pRes.data);
      setYearList(yRes.data.results ?? yRes.data);
    } catch { flash('Failed to load fee structures.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterProg, filterYear]);

  async function deleteStructure(id) {
    if (!window.confirm('Delete this fee structure?')) return;
    try { await fees.structureDelete(id); flash('Deleted.', 'success'); load(); }
    catch { flash('Cannot delete.', 'danger'); }
  }

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Fee Structures</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Fee Structures</h1>
          <p className="page-header__sub">Define fee schedules per programme and semester</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Add Fee Structure
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-money-dollar-circle-line" /> Fee Structures</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <select className="form-select" style={{ width: 180 }} value={filterProg} onChange={e => setFilterProg(e.target.value)}>
              <option value="">All Programmes</option>
              {progList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {yearList.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>
            {(filterProg || filterYear) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setFilterProg(''); setFilterYear(''); }}>
                <i className="ri-refresh-line" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : structures.length === 0 ? (
            <div className="empty-state"><i className="ri-money-dollar-circle-line" /><p>No fee structures found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Academic Year</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Tuition</th>
                    <th>Total Fee</th>
                    <th>Net Fee</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.programme_name}</td>
                      <td>{s.academic_year_display}</td>
                      <td>Year {s.year}</td>
                      <td>Sem {s.semester}</td>
                      <td>KES {Number(s.tuition_fee || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>KES {Number(s.total_fee || 0).toLocaleString()}</td>
                      <td>KES {Number(s.net_fee || 0).toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setModal(s)}><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteStructure(s.id)}><i className="ri-delete-bin-line" /></button>
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

      {modal && (
        <FeeModal
          fee={modal === 'add' ? null : modal}
          programmes={progList}
          academicYears={yearList}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
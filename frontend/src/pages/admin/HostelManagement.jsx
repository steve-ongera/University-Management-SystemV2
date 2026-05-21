import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hostels } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function HostelModal({ hostel, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(hostel?.id);
  const [form, setForm] = useState({
    name:         hostel?.name         || '',
    hostel_type:  hostel?.hostel_type  || 'male',
    total_floors: hostel?.total_floors || '',
    description:  hostel?.description  || '',
    is_active:    hostel?.is_active    ?? true,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      isEdit ? await hostels.update(hostel.id, form) : await hostels.create(form);
      flash(`Hostel ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save hostel.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Hostel' : 'Add Hostel'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Hostel Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Kilima Hostel" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Type</label>
                <select className="form-select" name="hostel_type" value={form.hostel_type} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Total Floors</label>
                <input type="number" className="form-control" name="total_floors" value={form.total_floors} onChange={handleChange} />
              </div>
              <div className="col-md-6" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  <span style={{ fontSize: 13 }}>Active</span>
                </label>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
              </div>
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

export default function HostelManagement() {
  const { flash } = useFlash();
  const [hostelList, setHostelList] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [filterType, setFilterType] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await hostels.list({ hostel_type: filterType });
      setHostelList(res.data.results ?? res.data);
    } catch { flash('Failed to load hostels.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterType]);

  async function deleteHostel(id) {
    if (!window.confirm('Delete this hostel?')) return;
    try { await hostels.delete(id); flash('Deleted.', 'success'); load(); }
    catch { flash('Cannot delete — rooms may be linked.', 'danger'); }
  }

  const totalBeds     = hostelList.reduce((s, h) => s + (h.total_beds || 0), 0);
  const availableBeds = hostelList.reduce((s, h) => s + (h.available_beds || 0), 0);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Hostels</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Hostel Management</h1>
          <p className="page-header__sub">Manage university hostels, rooms, and bookings</p>
        </div>
        <div className="page-header__actions">
          <Link to="/admin/hostel-bookings" className="btn btn-secondary btn-sm">
            <i className="ri-calendar-check-line" /> Bookings
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Add Hostel
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Hostels',    value: hostelList.length,                               color: 'primary', icon: 'ri-home-8-line' },
          { label: 'Total Beds',       value: totalBeds,                                       color: 'info',    icon: 'ri-hotel-bed-line' },
          { label: 'Available Beds',   value: availableBeds,                                   color: 'success', icon: 'ri-checkbox-circle-line' },
          { label: 'Occupied Beds',    value: totalBeds - availableBeds,                       color: 'warning', icon: 'ri-user-fill' },
          { label: 'Occupancy Rate',   value: totalBeds ? `${(((totalBeds - availableBeds) / totalBeds) * 100).toFixed(1)}%` : '0%', color: 'danger', icon: 'ri-percent-line' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${s.color}`}><i className={s.icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-home-8-line" /> Hostels</h5>
          <div className="flex items-center gap-3" style={{ marginLeft: 'auto' }}>
            <select className="form-select" style={{ width: 130 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : hostelList.length === 0 ? (
            <div className="empty-state"><i className="ri-home-8-line" /><p>No hostels found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hostel</th>
                    <th>Type</th>
                    <th>Floors</th>
                    <th>Warden</th>
                    <th>Total Beds</th>
                    <th>Available</th>
                    <th>Occupied</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hostelList.map(h => {
                    const occupied = (h.total_beds || 0) - (h.available_beds || 0);
                    const pct = h.total_beds ? Math.round((occupied / h.total_beds) * 100) : 0;
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 500 }}>{h.name}</td>
                        <td>
                          <span className={`badge ${h.hostel_type === 'male' ? 'badge-primary' : h.hostel_type === 'female' ? 'badge-danger' : 'badge-info'}`}>
                            {h.hostel_type}
                          </span>
                        </td>
                        <td>{h.total_floors || '—'}</td>
                        <td>{h.warden_name || '—'}</td>
                        <td>{h.total_beds || 0}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{h.available_beds || 0}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--success)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11 }}>{occupied} ({pct}%)</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${h.is_active ? 'badge-success' : 'badge-gray'}`}>
                            {h.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                            <Link to={`/admin/hostels/${h.id}`} className="btn-icon" title="Detail"><i className="ri-eye-line" /></Link>
                            <Link to={`/admin/hostels/${h.id}/bookings`} className="btn-icon" title="Bookings"><i className="ri-calendar-check-line" /></Link>
                            <button className="btn-icon" onClick={() => setModal(h)}><i className="ri-pencil-line" /></button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteHostel(h.id)}><i className="ri-delete-bin-line" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <HostelModal
          hostel={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
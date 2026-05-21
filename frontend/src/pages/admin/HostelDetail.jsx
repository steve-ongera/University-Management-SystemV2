import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { hostels } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

function RoomModal({ room, hostelId, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(room?.id);
  const [form, setForm] = useState({
    hostel:      hostelId,
    room_number: room?.room_number || '',
    floor:       room?.floor       || '',
    room_type:   room?.room_type   || 'single',
    capacity:    room?.capacity    || 1,
    is_active:   room?.is_active   ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      isEdit ? await hostels.roomUpdate(room.id, form) : await hostels.roomCreate(form);
      flash(`Room ${isEdit ? 'updated' : 'created'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save room.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--sm">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Room' : 'Add Room'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Room Number *</label>
                <input className="form-control" value={form.room_number} onChange={e => setForm(f => ({ ...f, room_number: e.target.value }))} placeholder="e.g. A-101" required />
              </div>
              <div>
                <label className="form-label">Floor</label>
                <input type="number" className="form-control" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Room Type</label>
                <select className="form-select" value={form.room_type} onChange={e => setForm(f => ({ ...f, room_type: e.target.value }))}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
              <div>
                <label className="form-label">Capacity</label>
                <input type="number" className="form-control" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} min={1} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <span style={{ fontSize: 13 }}>Active</span>
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

export default function HostelDetail() {
  const { id } = useParams();
  const { flash } = useFlash();
  const [hostel, setHostel] = useState(null);
  const [rooms,  setRooms]  = useState([]);
  const [beds,   setBeds]   = useState({});
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [hRes, rRes] = await Promise.all([hostels.get(id), hostels.rooms(id)]);
      setHostel(hRes.data);
      setRooms(rRes.data.results ?? rRes.data);
    } catch { flash('Failed to load hostel details.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function loadBeds(roomId) {
    if (beds[roomId]) { setExpandedRoom(expandedRoom === roomId ? null : roomId); return; }
    try {
      const res = await hostels.roomBeds(roomId);
      setBeds(b => ({ ...b, [roomId]: res.data.results ?? res.data }));
      setExpandedRoom(roomId);
    } catch { flash('Failed to load beds.', 'danger'); }
  }

  async function deleteRoom(roomId) {
    if (!window.confirm('Delete this room?')) return;
    try { await hostels.roomDelete(roomId); flash('Room deleted.', 'success'); load(); }
    catch { flash('Cannot delete room.', 'danger'); }
  }

  if (loading) return <div className="loading-block" style={{ height: '60vh' }}><span className="spinner" /> Loading…</div>;
  if (!hostel)  return <div className="empty-state"><i className="ri-home-8-line" /><p>Hostel not found.</p></div>;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/hostels">Hostels</Link></li>
          <li className="breadcrumb-item active">{hostel.name}</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">{hostel.name}</h1>
          <p className="page-header__sub">
            <span className={`badge badge-${hostel.hostel_type === 'male' ? 'primary' : hostel.hostel_type === 'female' ? 'danger' : 'info'}`}>{hostel.hostel_type}</span>
            &nbsp;&mdash;&nbsp;{hostel.total_floors} floors &mdash; Warden: {hostel.warden_name || 'N/A'}
          </p>
        </div>
        <div className="page-header__actions">
          <Link to={`/admin/hostels/${id}/bookings`} className="btn btn-secondary btn-sm">
            <i className="ri-calendar-check-line" /> Bookings
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> Add Room
          </button>
          <Link to="/admin/hostels" className="btn btn-secondary btn-sm">
            <i className="ri-arrow-left-line" /> Back
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Rooms',     value: rooms.length,                                color: 'primary', icon: 'ri-door-open-line' },
          { label: 'Total Beds',      value: hostel.total_beds || 0,                      color: 'info',    icon: 'ri-hotel-bed-line' },
          { label: 'Available Beds',  value: hostel.available_beds || 0,                  color: 'success', icon: 'ri-checkbox-circle-line' },
          { label: 'Occupied',        value: (hostel.total_beds || 0) - (hostel.available_beds || 0), color: 'warning', icon: 'ri-user-fill' },
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
        <div className="card-header"><h5><i className="ri-door-open-line" /> Rooms ({rooms.length})</h5></div>
        <div className="card-body" style={{ padding: 0 }}>
          {rooms.length === 0 ? (
            <div className="empty-state"><i className="ri-door-open-line" /><p>No rooms added yet.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room No.</th>
                    <th>Floor</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Available Beds</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <>
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.room_number}</td>
                        <td>Floor {r.floor}</td>
                        <td><span className="badge badge-gray">{r.room_type}</span></td>
                        <td>{r.capacity}</td>
                        <td>
                          <span style={{ color: (r.available_beds || 0) > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                            {r.available_beds ?? '—'}
                          </span>
                        </td>
                        <td><span className={`badge ${r.is_active ? 'badge-success' : 'badge-gray'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn-icon" title="View beds" onClick={() => loadBeds(r.id)}>
                              <i className={`ri-${expandedRoom === r.id ? 'arrow-up' : 'arrow-down'}-s-line`} />
                            </button>
                            <button className="btn-icon" onClick={() => setModal(r)}><i className="ri-pencil-line" /></button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteRoom(r.id)}><i className="ri-delete-bin-line" /></button>
                          </div>
                        </td>
                      </tr>
                      {expandedRoom === r.id && beds[r.id] && (
                        <tr key={`beds-${r.id}`}>
                          <td colSpan={7} style={{ background: 'var(--bg)', padding: '8px 20px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>BEDS IN ROOM {r.room_number}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {beds[r.id].map(b => (
                                <div key={b.id} style={{ padding: '4px 10px', background: b.is_occupied ? '#fce8e6' : '#e6f4ea', borderRadius: 'var(--radius-sm)', border: `1px solid ${b.is_occupied ? '#f5a5a0' : '#a8d5b5'}`, fontSize: 12 }}>
                                  <i className={`ri-${b.is_occupied ? 'user-fill' : 'user-line'}`} style={{ color: b.is_occupied ? 'var(--danger)' : 'var(--success)' }} /> {b.bed_number}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <RoomModal
          room={modal === 'add' ? null : modal}
          hostelId={id}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
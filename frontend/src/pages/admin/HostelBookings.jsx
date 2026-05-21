import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { hostels } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const STATUS_BADGE = {
  pending:   'badge-warning',
  approved:  'badge-success',
  rejected:  'badge-danger',
  cancelled: 'badge-gray',
  checked_in:  'badge-primary',
  checked_out: 'badge-info',
};

export default function HostelBookings() {
  const { id } = useParams();         // optional hostel ID (from /admin/hostels/:id/bookings)
  const { flash } = useFlash();
  const [bookings,   setBookings]   = useState([]);
  const [hostel,     setHostel]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setPage]      = useState(1);
  const PER_PAGE = 20;

  async function load() {
    setLoading(true);
    try {
      const params = { booking_status: filterStatus };
      if (id) params.hostel = id;
      const [bRes, hRes] = await Promise.all([
        hostels.bookingList(params),
        id ? hostels.get(id) : Promise.resolve(null),
      ]);
      setBookings(bRes.data.results ?? bRes.data);
      if (hRes) setHostel(hRes.data);
    } catch { flash('Failed to load bookings.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterStatus]);

  async function updateStatus(bookingId, status) {
    try {
      await hostels.bookingPatch(bookingId, { booking_status: status });
      flash(`Booking ${status}.`, 'success');
      load();
    } catch { flash('Failed to update status.', 'danger'); }
  }

  const q = search.toLowerCase();
  const filtered = bookings.filter(b =>
    !q || b.student_name?.toLowerCase().includes(q) || b.student_id?.toLowerCase().includes(q) || b.hostel_name?.toLowerCase().includes(q)
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pending  = bookings.filter(b => b.booking_status === 'pending').length;
  const approved = bookings.filter(b => b.booking_status === 'approved').length;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/hostels">Hostels</Link></li>
          {hostel && <li className="breadcrumb-item"><Link to={`/admin/hostels/${id}`}>{hostel.name}</Link></li>}
          <li className="breadcrumb-item active">Bookings</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Hostel Bookings{hostel ? ` — ${hostel.name}` : ''}</h1>
          <p className="page-header__sub">Review and manage hostel bed booking requests</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'primary', icon: 'ri-calendar-check-line' },
          { label: 'Pending',        value: pending,         color: 'warning', icon: 'ri-time-line' },
          { label: 'Approved',       value: approved,        color: 'success', icon: 'ri-checkbox-circle-line' },
          { label: 'Cancelled',      value: bookings.filter(b => b.booking_status === 'cancelled').length, color: 'danger', icon: 'ri-close-circle-line' },
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
          <h5><i className="ri-calendar-check-line" /> Bookings</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Student, hostel…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state"><i className="ri-calendar-check-line" /><p>No bookings found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Hostel</th>
                    <th>Room</th>
                    <th>Bed</th>
                    <th>Booked On</th>
                    <th>Total Fee</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.student_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.student_id}</div>
                      </td>
                      <td>{b.hostel_name}</td>
                      <td>{b.room_number}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.bed_number}</td>
                      <td style={{ fontSize: 12 }}>{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '—'}</td>
                      <td>KES {Number(b.total_fee || 0).toLocaleString()}</td>
                      <td style={{ color: Number(b.balance_due) > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        KES {Number(b.balance_due || 0).toLocaleString()}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[b.booking_status] || 'badge-gray'}`}>{b.booking_status}</span></td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          {b.booking_status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-success" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => updateStatus(b.id, 'approved')}>
                                Approve
                              </button>
                              <button className="btn btn-sm btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => updateStatus(b.id, 'rejected')}>
                                Reject
                              </button>
                            </>
                          )}
                          {b.booking_status === 'approved' && (
                            <button className="btn btn-sm btn-secondary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => updateStatus(b.id, 'checked_in')}>
                              Check In
                            </button>
                          )}
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
          <div className="card-footer flex items-center justify-between">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}><i className="ri-arrow-left-s-line" /></button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
                  .map((p, i) => p === '...'
                    ? <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                    : <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(p)}>{p}</button></li>
                  )}
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
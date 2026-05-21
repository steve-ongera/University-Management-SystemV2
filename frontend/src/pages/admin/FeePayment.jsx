import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fees } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const METHOD_BADGE = { mpesa: 'badge-success', equity: 'badge-primary', kcb: 'badge-info', cash: 'badge-gray', bank: 'badge-warning' };
const STATUS_BADGE  = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' };

export default function FeePayment() {
  const { flash } = useFlash();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setPage]  = useState(1);
  const PER_PAGE = 20;

  async function load() {
    setLoading(true);
    try {
      const res = await fees.paymentList({ method: filterMethod, status: filterStatus });
      setPayments(res.data.results ?? res.data);
    } catch { flash('Failed to load payments.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterMethod, filterStatus]);
  useEffect(() => { setPage(1); }, [search, filterMethod, filterStatus]);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return !q || p.student_name?.toLowerCase().includes(q) || p.student_id?.toLowerCase().includes(q) || p.transaction_id?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalAmount = filtered.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const completed   = filtered.filter(p => p.status === 'completed').length;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Payments</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Fee Payments</h1>
          <p className="page-header__sub">All student fee payment transactions</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary"><i className="ri-bank-card-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{filtered.length}</div>
            <div className="stat-card__label">Total Transactions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-checkbox-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{completed}</div>
            <div className="stat-card__label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><i className="ri-money-dollar-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">KES {totalAmount.toLocaleString()}</div>
            <div className="stat-card__label">Total Amount</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-bank-card-line" /> Transactions</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Student, Txn ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 130 }} value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
              <option value="">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="equity">Equity</option>
              <option value="kcb">KCB</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
            <select className="form-select" style={{ width: 120 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            {(filterMethod || filterStatus) && (
              <button className="btn btn-sm btn-secondary" onClick={() => { setFilterMethod(''); setFilterStatus(''); }}>
                <i className="ri-refresh-line" />
              </button>
            )}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state"><i className="ri-bank-card-line" /><p>No payments found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.student_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.student_id}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>KES {Number(p.amount).toLocaleString()}</td>
                      <td><span className={`badge ${METHOD_BADGE[p.payment_method] || 'badge-gray'}`}>{p.payment_method}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.transaction_id || '—'}</td>
                      <td style={{ fontSize: 12 }}>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                      <td style={{ fontSize: 12 }}>{p.processed_by_name || '—'}</td>
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
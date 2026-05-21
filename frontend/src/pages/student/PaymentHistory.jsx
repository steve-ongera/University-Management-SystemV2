/**
 * pages/student/PaymentHistory.jsx
 */

import { useState, useEffect } from 'react';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export function PaymentHistory() {
  const { flash } = useFlash();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [currentPage, setPage]  = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await students.myProfile();
        const res = await students.paymentHistory(profileRes.data.id);
        setPayments(res.data.results ?? res.data);
      } catch {
        flash('Could not load payment history.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const methodBadge = (method) => {
    const map = { mpesa: 'badge-success', equity: 'badge-primary', kcb: 'badge-info', cash: 'badge-gray', bank_transfer: 'badge-primary' };
    return <span className={`badge ${map[method] || 'badge-gray'}`}>{method?.replace('_', ' ').toUpperCase()}</span>;
  };

  const filtered = payments.filter(p =>
    !search ||
    p.transaction_reference?.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_method?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const totalPaid  = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><a href="/student/fees">Fees</a></li>
          <li className="breadcrumb-item active">Payment History</li>
        </ol>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Payment History</h1>
          <p className="page-header__sub">All your recorded fee payments</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-money-dollar-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">KES {totalPaid.toLocaleString()}</div>
            <div className="stat-card__label">Total Paid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary"><i className="ri-receipt-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{payments.length}</div>
            <div className="stat-card__label">Total Transactions</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h5>Transactions</h5>
          <div style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search reference…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" />Loading…</div>
          ) : pageData.length === 0 ? (
            <div className="empty-state"><i className="ri-receipt-line" /><p>No payments found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Date</th><th>Amount (KES)</th><th>Method</th><th>Reference</th><th>Academic Year</th></tr>
                </thead>
                <tbody>
                  {pageData.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{(currentPage - 1) * PER_PAGE + i + 1}</td>
                      <td>{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-KE') : '—'}</td>
                      <td style={{ fontWeight: 600 }}>{Number(p.amount).toLocaleString()}</td>
                      <td>{methodBadge(p.payment_method)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.transaction_reference}</td>
                      <td>{p.academic_year_display || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
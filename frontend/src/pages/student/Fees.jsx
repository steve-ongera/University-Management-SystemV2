/**
 * pages/student/Fees.jsx
 * Shows fee balance, fee structure breakdown, and initiates payment.
 */

import { useState, useEffect } from 'react';
import { students, fees } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function StudentFees() {
  const { flash } = useFlash();
  const [profile,    setProfile]   = useState(null);
  const [balance,    setBalance]   = useState(null);
  const [structure,  setStructure] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [payModal,   setPayModal]  = useState(false);
  const [payForm,    setPayForm]   = useState({ amount: '', method: 'mpesa', reference: '' });
  const [paying,     setPaying]    = useState(false);

  async function load() {
    try {
      const profileRes = await students.myProfile();
      setProfile(profileRes.data);
      const [balRes, feeRes] = await Promise.all([
        students.balance(profileRes.data.id),
        fees.structureList({ programme: profileRes.data.programme }),
      ]);
      setBalance(balRes.data);
      setStructure(feeRes.data.results ?? feeRes.data);
    } catch {
      flash('Could not load fee information.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handlePay(e) {
    e.preventDefault();
    if (!payForm.amount || !payForm.reference) {
      flash('Please fill all required fields.', 'warning');
      return;
    }
    setPaying(true);
    try {
      await fees.paymentCreate({
        student: profile.id,
        amount: payForm.amount,
        payment_method: payForm.method,
        transaction_reference: payForm.reference,
      });
      flash('Payment recorded successfully.', 'success');
      setPayModal(false);
      setPayForm({ amount: '', method: 'mpesa', reference: '' });
      load();
    } catch (err) {
      flash(err.response?.data?.detail || 'Payment failed.', 'danger');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading fees…</div></div>;

  const currentFeeStructure = structure[0];
  const paidPct = balance
    ? Math.min(100, Math.round((Number(balance.total_paid) / (Number(balance.total_fees) || 1)) * 100))
    : 0;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Fees</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">My Fees</h1>
          <p className="page-header__sub">Fee balance and payment details</p>
        </div>
        <div className="page-header__actions">
          <a href="/student/payment-history" className="btn btn-secondary btn-sm">
            <i className="ri-history-line" /> Payment History
          </a>
          <button className="btn btn-primary btn-sm" onClick={() => setPayModal(true)}>
            <i className="ri-bank-card-line" /> Make Payment
          </button>
        </div>
      </div>

      {/* Balance summary */}
      <div className="stats-grid">
        {[
          { label: 'Total Fees', value: balance ? `KES ${Number(balance.total_fees).toLocaleString()}` : '—', icon: 'ri-bill-line', color: 'primary' },
          { label: 'Total Paid',  value: balance ? `KES ${Number(balance.total_paid).toLocaleString()}` : '—', icon: 'ri-checkbox-circle-line', color: 'success' },
          { label: 'Balance Due', value: balance ? `KES ${Number(balance.balance).toLocaleString()}` : '—', icon: 'ri-error-warning-line', color: Number(balance?.balance) > 0 ? 'danger' : 'success' },
        ].map(({ label, value, icon, color }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-card__icon stat-card__icon--${color}`}><i className={icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {balance && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Payment Progress</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{paidPct}% paid</span>
            </div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div style={{
                width: `${paidPct}%`, height: '100%',
                background: paidPct >= 100 ? 'var(--success)' : paidPct > 50 ? 'var(--primary)' : 'var(--warning)',
                borderRadius: 8, transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Fee structure breakdown */}
      {currentFeeStructure && (
        <div className="card">
          <div className="card-header">
            <h5><i className="ri-list-check-2" style={{ marginRight: 6 }} />Fee Structure — {currentFeeStructure.academic_year_display}</h5>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th>Fee Component</th><th style={{ textAlign: 'right' }}>Amount (KES)</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Tuition Fee',        currentFeeStructure.tuition_fee],
                    ['Registration Fee',   currentFeeStructure.registration_fee],
                    ['Activity Fee',       currentFeeStructure.activity_fee],
                    ['Medical Fee',        currentFeeStructure.medical_fee],
                    ['Library Fee',        currentFeeStructure.library_fee],
                    ['Examination Fee',    currentFeeStructure.examination_fee],
                    ['Technology Fee',     currentFeeStructure.technology_fee],
                    ['Caution Money',      currentFeeStructure.caution_money],
                    ['Other Fees',         currentFeeStructure.other_fees],
                  ].filter(([, v]) => v && Number(v) > 0).map(([label, val]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {Number(val).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 600 }}>
                    <td>Total</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {Number(currentFeeStructure.total_fee).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(false)}>
          <div className="modal-box">
            <div className="modal-box__header">
              <h5>Record Payment</h5>
              <button className="modal-close" onClick={() => setPayModal(false)}><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-box__body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Amount (KES) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="number" className="form-control" placeholder="e.g. 5000"
                      value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                      <option value="mpesa">M-Pesa</option>
                      <option value="equity">Equity Bank</option>
                      <option value="kcb">KCB Bank</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Transaction Reference <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" placeholder="M-Pesa code / receipt number"
                      value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} required />
                  </div>
                </div>
              </div>
              <div className="modal-box__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={paying}>
                  {paying ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Processing…</> : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
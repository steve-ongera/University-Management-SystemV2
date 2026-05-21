/**
 * pages/student/Profile.jsx
 * View & edit own profile. Uses students.myProfile() + students.updateMyProfile().
 */

import { useState, useEffect, useRef } from 'react';
import { students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function StudentProfile() {
  const { flash } = useFlash();
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [loading, setLoading]   = useState(true);
  const [form,    setForm]      = useState({});
  const fileRef = useRef();

  async function load() {
    try {
      const res = await students.myProfile();
      setProfile(res.data);
      setForm({
        first_name:   res.data.user?.first_name   || '',
        last_name:    res.data.user?.last_name    || '',
        email:        res.data.user?.email        || '',
        phone:        res.data.user?.phone        || '',
        address:      res.data.user?.address      || '',
        gender:       res.data.user?.gender       || '',
        date_of_birth: res.data.user?.date_of_birth || '',
      });
    } catch {
      flash('Could not load profile.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await students.updateMyProfile(form);
      flash('Profile updated successfully.', 'success');
      setEditing(false);
      load();
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to update profile.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading profile…</div></div>;
  if (!profile) return null;

  const u = profile.user || {};

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">My Profile</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">My Profile</h1>
          <p className="page-header__sub">View and update your personal details</p>
        </div>
        <div className="page-header__actions">
          {editing ? (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSave}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : 'Save Changes'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
              <i className="ri-pencil-line" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="row g-3">
        {/* Left: avatar + read-only academic info */}
        <div className="col-md-4">
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              {u.profile_picture ? (
                <img src={u.profile_picture} alt="avatar"
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  fontSize: 36, fontWeight: 700,
                }}>
                  {(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{u.first_name} {u.last_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{profile.student_id}</div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge badge-${profile.status === 'active' ? 'success' : profile.status === 'suspended' ? 'danger' : 'warning'}`}>
                {profile.status}
              </span>
            </div>

            <hr style={{ margin: '16px 0' }} />

            {[
              ['Programme',    profile.programme_name],
              ['Year',         `Year ${profile.current_year}`],
              ['Semester',     `Semester ${profile.current_semester}`],
              ['Admission',    profile.admission_date],
              ['Reg Number',   profile.student_id],
            ].map(([label, value]) => (
              <div className="info-row" key={label} style={{ textAlign: 'left' }}>
                <span className="info-row__label">{label}</span>
                <span className="info-row__value">{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: editable form */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header"><h5>Personal Information</h5></div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={form.gender} onChange={handleChange} disabled={!editing}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" name="address" rows={2} value={form.address} onChange={handleChange} disabled={!editing} />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFlash } from '../../components/FlashMessages';

const ROLE_REDIRECTS = {
  admin:         '/admin/dashboard',
  student:       '/student/dashboard',
  lecturer:      '/lecturer/dashboard',
  professor:     '/lecturer/dashboard',
  finance:       '/finance/dashboard',
  cod:           '/cod/dashboard',
  dean:          '/dean/dashboard',
  hostel_warden: '/hostel/dashboard',
  registrar:     '/admin/dashboard',
  staff:         '/admin/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const { flash } = useFlash();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.password)        errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await login(form);
      const redirect = ROLE_REDIRECTS[user.user_type] || '/admin/dashboard';
      flash(`Welcome back, ${user.first_name}!`, 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || 'Invalid username or password.';
      flash(msg, 'danger');
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <i className="ri-building-2-line" />
          <h1>University ERP</h1>
          <p>Muranga University of Technology</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Username</label>
            <input
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              name="username"
              autoComplete="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
              >
                <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} />
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
            ) : (
              <><i className="ri-login-box-line" /> Sign In</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          University ERP v3.0 &mdash; For support contact IT Department
        </p>
      </div>
    </div>
  );
}
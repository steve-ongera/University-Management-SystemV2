import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    : '?';

  return (
    <header className="navbar">
      <div className="navbar__left">
        {title && <h2 className="navbar__title">{title}</h2>}
      </div>
      <div className="navbar__right">
        <span className="navbar__user">
          <span className="avatar-initials avatar-initials--sm">{initials}</span>
          <span>
            <strong>{user?.first_name} {user?.last_name}</strong>
            <small style={{ display: 'block', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.user_type}</small>
          </span>
        </span>
        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
          <i className="ri-logout-box-r-line" /> Logout
        </button>
      </div>
    </header>
  );
}
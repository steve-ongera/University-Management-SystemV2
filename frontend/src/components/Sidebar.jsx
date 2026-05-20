import { NavLink } from 'react-router-dom';

export default function Sidebar({ links = [], logo = 'UniERP' }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <i className="ri-building-2-line" />
        <span>{logo}</span>
      </div>
      <nav className="sidebar__nav">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            {link.icon && <i className={link.icon} />}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
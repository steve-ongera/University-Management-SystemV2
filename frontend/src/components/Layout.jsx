import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ links, title }) {
  return (
    <div className="app-shell">
      <Sidebar links={links} />
      <div className="app-shell__main">
        <Navbar title={title} />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
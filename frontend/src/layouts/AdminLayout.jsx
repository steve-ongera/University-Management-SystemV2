import Layout from '../components/Layout';

const links = [
  { label: 'Dashboard',       path: '/admin/dashboard',      icon: 'ri-dashboard-line' },
  { label: 'Students',        path: '/admin/students',       icon: 'ri-group-line' },
  { label: 'Lecturers',       path: '/admin/lecturers',      icon: 'ri-user-star-line' },
  { label: 'Academic',        path: '/admin/academic',       icon: 'ri-book-open-line' },
  { label: 'Academic Years',  path: '/admin/academic-years', icon: 'ri-calendar-line' },
  { label: 'Fee Structures',  path: '/admin/fees',           icon: 'ri-money-dollar-circle-line' },
  { label: 'Payments',        path: '/admin/payments',       icon: 'ri-bank-card-line' },
  { label: 'Timetable',       path: '/admin/timetable',      icon: 'ri-time-line' },
  { label: 'Hostels',         path: '/admin/hostels',        icon: 'ri-home-8-line' },
  { label: 'Library',         path: '/admin/library',        icon: 'ri-book-2-line' },
  { label: 'Notifications',   path: '/admin/notifications',  icon: 'ri-notification-line' },
  { label: 'News',            path: '/admin/news',           icon: 'ri-newspaper-line' },
  { label: 'Reports',         path: '/admin/reports',        icon: 'ri-bar-chart-line' },
  { label: 'Enrollments',     path: '/admin/enrollments',    icon: 'ri-list-check' },
  { label: 'Profile',         path: '/admin/profile',        icon: 'ri-user-line' },
];

export default function AdminLayout() {
  return <Layout links={links} title="Admin Portal" />;
}
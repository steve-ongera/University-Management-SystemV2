# University Management System — Django REST API + React Frontend

A full-stack University ERP system built with Django REST Framework as the backend API and React as the frontend. The project replaces the previous Django template-based frontend with a React single-page application while keeping all backend logic, models, and business rules intact.

---

## Overview

The system covers student management, academic records, faculty administration, research tracking, library management, financial operations, hostel management, and automated bank payment integration with Equity Bank, KCB Bank, and M-Pesa.

The frontend is a React SPA consuming the Django REST API. Each user role has its own sidebar, navbar, and page set. The UI is intentionally simple: sidebar, navbar, flash messages, and role-specific pages. No complex UI libraries are required beyond basic component structure.

---

## Architecture

```
university-erp/
├── backend/                    Django REST Framework API
└── frontend/                   React SPA
```

The Django backend exposes all data via REST endpoints. The React frontend communicates exclusively through these endpoints using Axios. Authentication is token-based (DRF Token Auth).

---

## Technology Stack

### Backend
- Python 3.10+
- Django 4.x
- Django REST Framework
- PostgreSQL
- Celery + Redis (async payment processing)
- Africa's Talking (SMS)
- SMTP (email notifications)

### Frontend
- React 18
- React Router v6
- Axios
- Context API (auth state)
- Plain CSS modules (no Tailwind, no UI library)

### Payment Gateways
- Equity Bank Webhook API
- KCB Bank Webhook API
- M-Pesa Daraja API (Safaricom)

---

## Project Structure

```
university-erp/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── university_erp_system/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   └── core_application/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       ├── signals.py
│       ├── tasks.py
│       ├── utils.py
│       ├── middleware.py
│       ├── permissions.py
│       │
│       ├── api/
│       │   ├── auth.py
│       │   ├── students.py
│       │   ├── lecturers.py
│       │   ├── courses.py
│       │   ├── grades.py
│       │   ├── attendance.py
│       │   ├── fees.py
│       │   ├── hostels.py
│       │   ├── library.py
│       │   ├── research.py
│       │   ├── notifications.py
│       │   └── webhooks/
│       │       ├── equity.py
│       │       ├── kcb.py
│       │       └── mpesa.py
│       │
│       └── management/
│           └── commands/
│               ├── generate_students.py
│               ├── generate_lecturers.py
│               ├── generate_courses.py
│               ├── generate_hostels.py
│               ├── generate_fee_structures.py
│               └── seed_data.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        │
        ├── api/
        │   ├── axios.js               Base Axios instance with token injection
        │
        ├── context/
        │   └── AuthContext.jsx         Global auth state, user role, token
        │
        ├── components/
        │   ├── Navbar.jsx              Shared navbar shell (role fills content)
        │   ├── Sidebar.jsx             Shared sidebar shell (role fills links)
        │   ├── FlashMessages.jsx       Global flash/toast messages
        │   ├── ProtectedRoute.jsx      Route guard by role
        │   └── Layout.jsx              Wraps Sidebar + Navbar + content area
        │
        ├── layouts/
        │   ├── AdminLayout.jsx         Admin sidebar + navbar composition
        │   ├── StudentLayout.jsx
        │   ├── LecturerLayout.jsx
        │   ├── FinanceLayout.jsx
        │   ├── CodLayout.jsx           Chairman of Department
        │   ├── DeanLayout.jsx
        │   └── HostelLayout.jsx        Hostel warden
        │
        ├── pages/
        │   │
        │   ├── auth/
        │   │   └── Login.jsx           Single login page, redirects by role
        │   │
        │   ├── admin/
        │   │   ├── Dashboard.jsx
        │   │   ├── students/
        │   │   │   ├── StudentList.jsx
        │   │   │   ├── StudentDetail.jsx
        │   │   │   ├── StudentForm.jsx
        │   │   │   └── StudentPerformance.jsx
        │   │   ├── AcademicManagement.jsx
        │   │   ├── AcademicYearManagement.jsx
        │   │   ├── FeeStructureList.jsx
        │   │   ├── FeePayment.jsx
        │   │   ├── TimetableManagement.jsx
        │   │   ├── NotificationManagement.jsx
        │   │   ├── NewsManagement.jsx
        │   │   ├── HostelManagement.jsx
        │   │   ├── HostelDetail.jsx
        │   │   ├── HostelBookings.jsx
        │   │   ├── LecturerAllocationDashboard.jsx
        │   │   ├── ReportingOverview.jsx
        │   │   ├── ReportsList.jsx
        │   │   ├── StudentEnrollmentList.jsx
        │   │   ├── StudentTranscript.jsx
        │   │   └── AdminProfile.jsx
        │   │
        │   ├── student/
        │   │   ├── Dashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── Subjects.jsx
        │   │   ├── Timetable.jsx
        │   │   ├── Attendance.jsx
        │   │   ├── AttendanceHistory.jsx
        │   │   ├── Grades.jsx
        │   │   ├── ExamResults.jsx
        │   │   ├── ExamSchedule.jsx
        │   │   ├── ExamRepository.jsx
        │   │   ├── Assignments.jsx
        │   │   ├── AssignmentDetail.jsx
        │   │   ├── Fees.jsx
        │   │   ├── PaymentHistory.jsx
        │   │   ├── Library.jsx
        │   │   ├── Notifications.jsx
        │   │   ├── MessagesInbox.jsx
        │   │   ├── MessageDetail.jsx
        │   │   ├── ComposeMessage.jsx
        │   │   ├── SentMessages.jsx
        │   │   ├── Events.jsx
        │   │   ├── Clubs.jsx
        │   │   ├── News.jsx
        │   │   ├── Transcript.jsx
        │   │   ├── ApplyDeferment.jsx
        │   │   ├── DefermentList.jsx
        │   │   ├── ApplySpecialExam.jsx
        │   │   ├── SpecialExamList.jsx
        │   │   ├── RequestClearance.jsx
        │   │   ├── ClearanceList.jsx
        │   │   ├── StudentReporting.jsx
        │   │   ├── MarkAttendanceQR.jsx
        │   │   ├── ScanAttendanceQR.jsx
        │   │   └── ChangePassword.jsx
        │   │
        │   ├── lecturer/
        │   │   ├── Dashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── Timetable.jsx
        │   │   ├── UnitDashboard.jsx
        │   │   ├── CourseDetail.jsx
        │   │   ├── GradeEntry.jsx
        │   │   ├── AttendanceDashboard.jsx
        │   │   ├── AttendanceDetail.jsx
        │   │   ├── GenerateQRAttendance.jsx
        │   │   ├── CreateAssignment.jsx
        │   │   ├── CreateNotes.jsx
        │   │   ├── MyStudents.jsx
        │   │   ├── Curriculum.jsx
        │   │   └── Support.jsx
        │   │
        │   ├── finance/
        │   │   ├── Dashboard.jsx
        │   │   ├── FeeStructureList.jsx
        │   │   ├── AddFeeStructure.jsx
        │   │   ├── EditFeeStructure.jsx
        │   │   ├── FeePaymentList.jsx
        │   │   ├── FeePaymentDetail.jsx
        │   │   └── ProgrammeFeeDetail.jsx
        │   │
        │   ├── cod/
        │   │   ├── Dashboard.jsx
        │   │   ├── DepartmentInfo.jsx
        │   │   ├── Courses.jsx
        │   │   ├── CourseAssignments.jsx
        │   │   ├── LecturersList.jsx
        │   │   ├── LecturerDetail.jsx
        │   │   ├── StudentsList.jsx
        │   │   ├── StudentDetail.jsx
        │   │   ├── StudentPerformance.jsx
        │   │   ├── EnrollmentsList.jsx
        │   │   ├── EnrollmentReport.jsx
        │   │   ├── TimetableCreate.jsx
        │   │   ├── TimetableDashboard.jsx
        │   │   ├── TimetableView.jsx
        │   │   ├── ExamSchedule.jsx
        │   │   ├── GenerateExamList.jsx
        │   │   ├── MarksApproval.jsx
        │   │   ├── PerformanceReport.jsx
        │   │   ├── Programmes.jsx
        │   │   ├── ResearchDashboard.jsx
        │   │   ├── ResearchDetail.jsx
        │   │   ├── ResearchCreate.jsx
        │   │   ├── ResearchEdit.jsx
        │   │   ├── DefermentApplications.jsx
        │   │   ├── SpecialExamApplications.jsx
        │   │   ├── ClearanceRequests.jsx
        │   │   └── WorkloadAnalysis.jsx
        │   │
        │   ├── dean/
        │   │   ├── Dashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── DepartmentsList.jsx
        │   │   ├── DepartmentDetail.jsx
        │   │   ├── Programmes.jsx
        │   │   ├── ProgrammeDetail.jsx
        │   │   ├── LecturerList.jsx
        │   │   ├── LecturerDetail.jsx
        │   │   ├── LecturerAssignments.jsx
        │   │   ├── AllocateCourses.jsx
        │   │   ├── HodsManagement.jsx
        │   │   ├── StudentList.jsx
        │   │   ├── StudentDetail.jsx
        │   │   ├── StudentPerformance.jsx
        │   │   └── Report.jsx
        │   │
        │   └── hostel/
        │       ├── Dashboard.jsx
        │       ├── HostelList.jsx
        │       ├── RoomList.jsx
        │       ├── RoomManagement.jsx
        │       ├── BedList.jsx
        │       ├── BookBed.jsx
        │       ├── ManageBookings.jsx
        │       ├── BookingDetail.jsx
        │       └── CancelBooking.jsx
        │
        └── styles/
            ├── global.css
            
```

---

## User Roles and Redirect Targets

After login, the API returns the user's `user_type`. The Login page reads this and redirects accordingly.

| user_type       | Redirect target         |
|-----------------|-------------------------|
| admin           | /admin/dashboard        |
| student         | /student/dashboard      |
| lecturer        | /lecturer/dashboard     |
| professor       | /lecturer/dashboard     |
| finance         | /finance/dashboard      |
| cod             | /cod/dashboard          |
| dean            | /dean/dashboard         |
| hostel_warden   | /hostel/dashboard       |
| registrar       | /admin/dashboard        |
| staff           | /admin/dashboard        |

---

## Frontend Component Responsibilities

### App.jsx
Defines all routes using React Router v6. Wraps role-based layouts around their respective pages. Applies ProtectedRoute to all authenticated paths.

### AuthContext.jsx
Stores token, user object, and user_type in React context. Provides login(), logout() functions. Token is persisted in localStorage. All Axios requests attach the token via an interceptor in api/axios.js.

### Layout.jsx
A wrapper component that accepts a sidebar config and renders:
```
[Sidebar] [Navbar]
          [FlashMessages]
          [children / Outlet]
```

### Sidebar.jsx
Receives a `links` prop (array of label + path + icon string). Renders the nav list. Each role layout passes its own links array. No hardcoded links inside Sidebar.jsx itself.

### Navbar.jsx
Receives `title` and `user` props. Shows page title, user name, and a logout button. No hardcoded user data inside Navbar.jsx.

### FlashMessages.jsx
Reads from a global flash context or a passed messages prop. Renders dismissible message banners. Auto-dismisses after 4 seconds.

### ProtectedRoute.jsx
Reads auth state from AuthContext. If unauthenticated, redirects to /login. Accepts an `allowedRoles` prop to restrict by role.

---

## Layout Files Per Role

Each layout file (e.g. AdminLayout.jsx) does the following:
1. Defines the sidebar links array for that role
2. Passes links to Sidebar
3. Passes title and user to Navbar
4. Renders Layout with Outlet inside

Example structure for AdminLayout.jsx:
```jsx
const links = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Students', path: '/admin/students' },
  { label: 'Fee Structures', path: '/admin/fees' },
  { label: 'Timetable', path: '/admin/timetable' },
  { label: 'Notifications', path: '/admin/notifications' },
  { label: 'Hostels', path: '/admin/hostels' },
  { label: 'Reports', path: '/admin/reports' },
];
```

Student, Lecturer, Finance, COD, Dean, and HostelWarden layouts follow the same pattern with their own link sets.

---

## Backend API Structure

All endpoints are prefixed with `/api/`.

### Authentication
```
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/me/
POST   /api/auth/change-password/
```

### Students
```
GET    /api/students/
POST   /api/students/
GET    /api/students/{id}/
PUT    /api/students/{id}/
DELETE /api/students/{id}/
GET    /api/students/{id}/balance/
GET    /api/students/{id}/transcript/
GET    /api/students/{id}/grades/
GET    /api/students/{id}/payment-history/
GET    /api/students/{id}/enrollments/
GET    /api/students/{id}/attendance/
```

### Courses and Enrollment
```
GET    /api/courses/
GET    /api/courses/{id}/
GET    /api/programmes/
GET    /api/departments/
POST   /api/enrollments/
DELETE /api/enrollments/{id}/
GET    /api/enrollments/?student={id}&semester={id}
```

### Grades
```
POST   /api/grades/
GET    /api/grades/{id}/
PUT    /api/grades/{id}/
GET    /api/grades/?course={id}&semester={id}
```

### Attendance
```
POST   /api/attendance/sessions/
GET    /api/attendance/sessions/{token}/
POST   /api/attendance/mark/
GET    /api/attendance/?student={id}&course={id}
```

### Fees and Payments
```
GET    /api/fee-structures/
POST   /api/fee-structures/
PUT    /api/fee-structures/{id}/
DELETE /api/fee-structures/{id}/
GET    /api/payments/
POST   /api/payments/
GET    /api/payments/{id}/
```

### Hostel
```
GET    /api/hostels/
GET    /api/hostels/{id}/
GET    /api/hostels/{id}/rooms/
GET    /api/rooms/{id}/beds/
POST   /api/hostel-bookings/
GET    /api/hostel-bookings/
PUT    /api/hostel-bookings/{id}/
```

### Library
```
GET    /api/library/
POST   /api/library/transactions/
GET    /api/library/transactions/?user={id}
```

### Research
```
GET    /api/research/
POST   /api/research/
GET    /api/research/{id}/
PUT    /api/research/{id}/
```

### Notifications and Messages
```
GET    /api/notifications/
POST   /api/notifications/
GET    /api/messages/
POST   /api/messages/
GET    /api/messages/{id}/
```

### Applications
```
POST   /api/deferments/
GET    /api/deferments/?student={id}
PUT    /api/deferments/{id}/
POST   /api/special-exams/
GET    /api/special-exams/?student={id}
POST   /api/clearances/
GET    /api/clearances/?student={id}
```

### Bank Webhooks
```
POST   /api/webhooks/equity/
POST   /api/webhooks/kcb/
POST   /api/webhooks/mpesa/
```

### Analytics
```
GET    /api/analytics/dashboard/
GET    /api/analytics/metrics/
GET    /api/analytics/activity-log/
```

---

## Backend Setup

### 1. Clone and navigate to backend

```bash
git clone https://github.com/yourusername/university-erp.git
cd university-erp/backend
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=university_db
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

AT_USERNAME=your_africastalking_username
AT_API_KEY=your_africastalking_api_key
AT_SENDER_ID=UNIV

EQUITY_API_URL=https://api.equitybank.co.ke/v1
EQUITY_MERCHANT_CODE=your_merchant_code
EQUITY_API_KEY=your_api_key
EQUITY_SECRET_KEY=your_secret_key

KCB_API_URL=https://api.kcbgroup.com/v1
KCB_CLIENT_ID=your_client_id
KCB_CLIENT_SECRET=your_client_secret

MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/webhooks/mpesa/

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Database and superuser

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Seed sample data

```bash
python manage.py generate_academic_years
python manage.py generate_faculties
python manage.py generate_programmes
python manage.py generate_courses
python manage.py generate_lecturers
python manage.py generate_students
python manage.py generate_fee_structures
python manage.py generate_hostels
```

### 6. Start Redis and Celery

```bash
redis-server
celery -A university_erp_system worker -l info
celery -A university_erp_system beat -l info
```

### 7. Run backend server

```bash
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

---

## Frontend Setup

### 1. Navigate to frontend

```bash
cd university-erp/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API base URL

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Run development server

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

No CSS framework is used. All styles are plain CSS modules scoped per component.

---

## Backend Dependencies (requirements.txt)

```
Django==4.2
djangorestframework==3.15
django-cors-headers==4.3
psycopg2-binary==2.9
celery==5.3
redis==5.0
requests==2.31
africastalking==1.2
Pillow==10.0
django-filter==23.5
djangorestframework-simplejwt==5.3
python-decouple==3.8
qrcode==7.4
openpyxl==3.1
sentry-sdk==1.38
```

---

## CORS Configuration

In `settings.py`:

```python
INSTALLED_APPS += ['corsheaders']

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... rest of middleware
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://yourdomain.com',
]
```

---

## Authentication Flow

1. User visits `/login`
2. Submits username and password
3. Frontend POSTs to `/api/auth/login/`
4. Backend returns `{ token, user: { id, username, user_type, first_name, last_name } }`
5. Frontend stores token in localStorage, user in AuthContext
6. Login page reads `user_type` and redirects to the correct dashboard route
7. All subsequent requests include `Authorization: Token <token>` header via Axios interceptor
8. On logout, token is deleted from localStorage and user is cleared from context

---

## Role-Based Route Protection

In App.jsx, routes are wrapped:

```jsx
<ProtectedRoute allowedRoles={['admin', 'registrar', 'staff']}>
  <AdminLayout>
    <Outlet />
  </AdminLayout>
</ProtectedRoute>
```

ProtectedRoute checks:
- Is the user authenticated (token exists and is valid)?
- Does the user's role match `allowedRoles`?
- If not, redirect to `/login` or `/unauthorized`

---

## Sidebar Link Sets Per Role

### Admin
- Dashboard
- Students
- Lecturers
- Programmes
- Courses
- Timetable
- Fee Structures
- Payments
- Hostels
- Library
- Notifications
- Reports
- Analytics
- News
- Settings

### Student
- Dashboard
- My Profile
- Subjects
- Timetable
- Attendance
- Grades
- Exam Schedule
- Exam Repository
- Assignments
- Fees
- Payment History
- Library
- Messages
- Notifications
- Events
- Clubs
- News
- Transcript
- Applications (Deferment, Special Exam, Clearance)

### Lecturer
- Dashboard
- My Profile
- My Timetable
- My Units
- Grade Entry
- Attendance
- QR Attendance
- Assignments
- Course Notes
- My Students

### Finance
- Dashboard
- Fee Structures
- Payments
- Reports
- Programme Fees

### Chairman of Department (COD)
- Dashboard
- Department Info
- Courses
- Course Assignments
- Lecturers
- Students
- Enrollments
- Timetable
- Exam Schedule
- Marks Approval
- Performance Reports
- Research
- Applications (Deferment, Special Exam, Clearance)
- Workload Analysis

### Dean
- Dashboard
- Departments
- Programmes
- Lecturers
- Course Allocations
- HOD Management
- Students
- Reports

### Hostel Warden
- Dashboard
- Hostel List
- Rooms
- Beds
- Bookings
- Manage Bookings

---

## Production Deployment

### Backend (Ubuntu)

```bash
pip install gunicorn
gunicorn --workers 4 --bind 0.0.0.0:8000 university_erp_system.wsgi:application
```

Nginx proxies `/api/` to `localhost:8000` and serves the React build for everything else.

### Frontend

```bash
npm run build
```

Output is in `frontend/dist/`. Serve with Nginx or any static file host.

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name erp.youruniversity.ac.ke;

    ssl_certificate /etc/letsencrypt/live/erp.youruniversity.ac.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.youruniversity.ac.ke/privkey.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/deploy/backend/staticfiles/;
    }

    location /media/ {
        alias /home/deploy/backend/media/;
    }

    location / {
        root /home/deploy/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

The `try_files /index.html` fallback is essential for React Router to handle client-side routing correctly.

---

## Migrating from Django Templates

The backend models, business logic, Celery tasks, signals, and management commands remain unchanged. What changes is the view layer:

- All Django template views are replaced by DRF APIView or ViewSet classes
- All HTML templates are removed
- Serializers are added for every model
- The React frontend takes over all rendering
- URL patterns under the old template views are replaced with API endpoint URLs

Existing Django admin at `/django-admin/` remains available for superusers and internal debugging.

---

## Security

- HTTPS enforced in production
- Token authentication on all API endpoints
- Webhook signature verification for all bank callbacks (HMAC SHA-256)
- IP whitelisting middleware for bank webhook endpoints
- Rate limiting via DRF throttle classes
- Admin login with optional 2FA (existing AdminTwoFactorCode model retained)
- CORS restricted to known frontend origins
- `DEBUG=False` in production with proper `ALLOWED_HOSTS`

---

## Bank Integration

The bank webhook flow is unchanged from the original implementation. Webhooks post to:

- `/api/webhooks/equity/`
- `/api/webhooks/kcb/`
- `/api/webhooks/mpesa/`

Celery processes each payment asynchronously, creates the payment record, updates the student account, and dispatches SMS and email notifications.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `frontend/src/api/axios.js` | Axios instance with auth header interceptor |
| `frontend/src/context/AuthContext.jsx` | Global auth state, login, logout |
| `frontend/src/components/ProtectedRoute.jsx` | Route guard checking token and role |
| `frontend/src/components/Layout.jsx` | Base layout wrapper used by all role layouts |
| `frontend/src/components/Sidebar.jsx` | Renders nav links passed as props |
| `frontend/src/components/Navbar.jsx` | Top bar with user info and logout |
| `frontend/src/components/FlashMessages.jsx` | Global toast/alert display |
| `frontend/src/pages/auth/Login.jsx` | Login form with role-based redirect |
| `backend/core_application/serializers.py` | All DRF serializers |
| `backend/core_application/permissions.py` | Custom DRF permission classes per role |
| `backend/core_application/tasks.py` | Celery tasks for payments and notifications |

---

## Roadmap

### Phase 1 (Current — Migration)
- Replace all Django template views with DRF API views
- Build React frontend with role-based layout and routing
- Migrate all pages from .html to .jsx

### Phase 2
- Mobile-responsive CSS improvements
- Advanced reporting dashboard
- Online examination system
- Parent portal

### Phase 3
- React Native mobile application
- AI-powered analytics
- Chatbot support
- Alumni management
- Blockchain certificate verification
- Multi-language support

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Commit your changes: `git commit -m 'Add feature-name'`
4. Push to the branch: `git push origin feature/feature-name`
5. Open a pull request

Backend code follows PEP 8. Frontend follows standard React conventions with functional components and hooks only. No class components.

---

## License

MIT License. See LICENSE file for details.

---

## Contact

Project Maintainer: Steve Ongera
Email: steve.ongera@mut.ac.ke
Institution: Muranga University of Technology
Location: Murang'a, Kenya

Version: 3.0.0
Status: In Development
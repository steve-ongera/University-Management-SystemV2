import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ── Auth ──────────────────────────────────────────────────────────────────────
import Login from './pages/auth/Login';

// ── Layouts ───────────────────────────────────────────────────────────────────
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import LecturerLayout from './layouts/LecturerLayout';
import FinanceLayout from './layouts/FinanceLayout';
import CodLayout from './layouts/CodLayout';
import DeanLayout from './layouts/DeanLayout';
import HostelLayout from './layouts/HostelLayout';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard';
import StudentList from './pages/admin/students/StudentList';
import StudentDetail from './pages/admin/students/StudentDetail';
import StudentForm from './pages/admin/students/StudentForm';
import StudentPerformance from './pages/admin/students/StudentPerformance';
import AcademicManagement from './pages/admin/AcademicManagement';
import AcademicYearManagement from './pages/admin/AcademicYearManagement';
import FeeStructureList from './pages/admin/FeeStructureList';
import FeePayment from './pages/admin/FeePayment';
import TimetableManagement from './pages/admin/TimetableManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import NewsManagement from './pages/admin/NewsManagement';
import HostelManagement from './pages/admin/HostelManagement';
import HostelDetail from './pages/admin/HostelDetail';
import HostelBookings from './pages/admin/HostelBookings';
import LecturerAllocationDashboard from './pages/admin/LecturerAllocationDashboard';
import ReportingOverview from './pages/admin/ReportingOverview';
import ReportsList from './pages/admin/ReportsList';
import StudentEnrollmentList from './pages/admin/StudentEnrollmentList';
import StudentTranscript from './pages/admin/StudentTranscript';
import AdminProfile from './pages/admin/AdminProfile';

// ── Student Pages ─────────────────────────────────────────────────────────────
import StudentDashboard from './pages/student/Dashboard';
import StudentProfilePage from './pages/student/Profile';
import Subjects from './pages/student/Subjects';
import StudentTimetable from './pages/student/Timetable';
import StudentAttendance from './pages/student/Attendance';
import AttendanceHistory from './pages/student/AttendanceHistory';
import Grades from './pages/student/Grades';
import ExamResults from './pages/student/ExamResults';
import ExamSchedule from './pages/student/ExamSchedule';
import ExamRepository from './pages/student/ExamRepository';
import Assignments from './pages/student/Assignments';
import AssignmentDetail from './pages/student/AssignmentDetail';
import Fees from './pages/student/Fees';
import PaymentHistory from './pages/student/PaymentHistory';
import Library from './pages/student/Library';
import StudentNotifications from './pages/student/Notifications';
import MessagesInbox from './pages/student/MessagesInbox';
import MessageDetail from './pages/student/MessageDetail';
import ComposeMessage from './pages/student/ComposeMessage';
import SentMessages from './pages/student/SentMessages';
import Events from './pages/student/Events';
import Clubs from './pages/student/Clubs';
import News from './pages/student/News';
import Transcript from './pages/student/Transcript';
import ApplyDeferment from './pages/student/ApplyDeferment';
import DefermentList from './pages/student/DefermentList';
import ApplySpecialExam from './pages/student/ApplySpecialExam';
import SpecialExamList from './pages/student/SpecialExamList';
import RequestClearance from './pages/student/RequestClearance';
import ClearanceList from './pages/student/ClearanceList';
import StudentReporting from './pages/student/StudentReporting';
import MarkAttendanceQR from './pages/student/MarkAttendanceQR';
import ScanAttendanceQR from './pages/student/ScanAttendanceQR';
import ChangePassword from './pages/student/ChangePassword';

// ── Lecturer Pages ────────────────────────────────────────────────────────────
import LecturerDashboard from './pages/lecturer/Dashboard';
import LecturerProfile from './pages/lecturer/Profile';
import LecturerTimetable from './pages/lecturer/Timetable';
import UnitDashboard from './pages/lecturer/UnitDashboard';
import CourseDetail from './pages/lecturer/CourseDetail';
import GradeEntry from './pages/lecturer/GradeEntry';
import AttendanceDashboard from './pages/lecturer/AttendanceDashboard';
import AttendanceDetail from './pages/lecturer/AttendanceDetail';
import GenerateQRAttendance from './pages/lecturer/GenerateQRAttendance';
import CreateAssignment from './pages/lecturer/CreateAssignment';
import CreateNotes from './pages/lecturer/CreateNotes';
import MyStudents from './pages/lecturer/MyStudents';
import Curriculum from './pages/lecturer/Curriculum';
import Support from './pages/lecturer/Support';

// ── Finance Pages ─────────────────────────────────────────────────────────────
import FinanceDashboard from './pages/finance/Dashboard';
import FinanceFeeStructureList from './pages/finance/FeeStructureList';
import AddFeeStructure from './pages/finance/AddFeeStructure';
import EditFeeStructure from './pages/finance/EditFeeStructure';
import FeePaymentList from './pages/finance/FeePaymentList';
import FeePaymentDetail from './pages/finance/FeePaymentDetail';
import ProgrammeFeeDetail from './pages/finance/ProgrammeFeeDetail';

// ── COD Pages ─────────────────────────────────────────────────────────────────
import CodDashboard from './pages/cod/Dashboard';
import DepartmentInfo from './pages/cod/DepartmentInfo';
import CodCourses from './pages/cod/Courses';
import CourseAssignments from './pages/cod/CourseAssignments';
import CodLecturersList from './pages/cod/LecturersList';
import CodLecturerDetail from './pages/cod/LecturerDetail';
import CodStudentsList from './pages/cod/StudentsList';
import CodStudentDetail from './pages/cod/StudentDetail';
import CodStudentPerformance from './pages/cod/StudentPerformance';
import EnrollmentsList from './pages/cod/EnrollmentsList';
import EnrollmentReport from './pages/cod/EnrollmentReport';
import TimetableCreate from './pages/cod/TimetableCreate';
import TimetableDashboard from './pages/cod/TimetableDashboard';
import TimetableView from './pages/cod/TimetableView';
import CodExamSchedule from './pages/cod/ExamSchedule';
import GenerateExamList from './pages/cod/GenerateExamList';
import MarksApproval from './pages/cod/MarksApproval';
import PerformanceReport from './pages/cod/PerformanceReport';
import Programmes from './pages/cod/Programmes';
import ResearchDashboard from './pages/cod/ResearchDashboard';
import ResearchDetail from './pages/cod/ResearchDetail';
import ResearchCreate from './pages/cod/ResearchCreate';
import ResearchEdit from './pages/cod/ResearchEdit';
import CodDefermentApplications from './pages/cod/DefermentApplications';
import CodSpecialExamApplications from './pages/cod/SpecialExamApplications';
import CodClearanceRequests from './pages/cod/ClearanceRequests';
import WorkloadAnalysis from './pages/cod/WorkloadAnalysis';

// ── Dean Pages ────────────────────────────────────────────────────────────────
import DeanDashboard from './pages/dean/Dashboard';
import DeanProfile from './pages/dean/Profile';
import DepartmentsList from './pages/dean/DepartmentsList';
import DepartmentDetail from './pages/dean/DepartmentDetail';
import DeanProgrammes from './pages/dean/Programmes';
import ProgrammeDetail from './pages/dean/ProgrammeDetail';
import DeanLecturerList from './pages/dean/LecturerList';
import DeanLecturerDetail from './pages/dean/LecturerDetail';
import LecturerAssignments from './pages/dean/LecturerAssignments';
import AllocateCourses from './pages/dean/AllocateCourses';
import HodsManagement from './pages/dean/HodsManagement';
import DeanStudentList from './pages/dean/StudentList';
import DeanStudentDetail from './pages/dean/StudentDetail';
import DeanStudentPerformance from './pages/dean/StudentPerformance';
import DeanReport from './pages/dean/Report';

// ── Hostel Pages ──────────────────────────────────────────────────────────────
import HostelDashboard from './pages/hostel/Dashboard';
import HostelList from './pages/hostel/HostelList';
import RoomList from './pages/hostel/RoomList';
import RoomManagement from './pages/hostel/RoomManagement';
import BedList from './pages/hostel/BedList';
import BookBed from './pages/hostel/BookBed';
import ManageBookings from './pages/hostel/ManageBookings';
import BookingDetail from './pages/hostel/BookingDetail';
import CancelBooking from './pages/hostel/CancelBooking';

// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_ROLES   = ['admin', 'registrar', 'staff'];
const LECTURER_ROLES = ['lecturer', 'professor'];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />

            {/* Students */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<StudentForm />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/:id/edit" element={<StudentForm />} />
            <Route path="students/:id/performance" element={<StudentPerformance />} />
            <Route path="students/:id/transcript" element={<StudentTranscript />} />
            <Route path="students/enrollments" element={<StudentEnrollmentList />} />

            {/* Academic */}
            <Route path="academic" element={<AcademicManagement />} />
            <Route path="academic-years" element={<AcademicYearManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />

            {/* Finance */}
            <Route path="fees" element={<FeeStructureList />} />
            <Route path="fees/payment" element={<FeePayment />} />

            {/* Hostels */}
            <Route path="hostels" element={<HostelManagement />} />
            <Route path="hostels/:id" element={<HostelDetail />} />
            <Route path="hostels/bookings" element={<HostelBookings />} />

            {/* Communications */}
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="news" element={<NewsManagement />} />

            {/* Lecturers */}
            <Route path="lecturer-allocation" element={<LecturerAllocationDashboard />} />

            {/* Reports */}
            <Route path="reporting" element={<ReportingOverview />} />
            <Route path="reports" element={<ReportsList />} />
          </Route>

          {/* ── Student ── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="change-password" element={<ChangePassword />} />

            {/* Academics */}
            <Route path="subjects" element={<Subjects />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="grades" element={<Grades />} />
            <Route path="transcript" element={<Transcript />} />

            {/* Attendance */}
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="attendance/history" element={<AttendanceHistory />} />
            <Route path="attendance/mark-qr" element={<MarkAttendanceQR />} />
            <Route path="attendance/scan" element={<ScanAttendanceQR />} />

            {/* Exams */}
            <Route path="exam-results" element={<ExamResults />} />
            <Route path="exam-schedule" element={<ExamSchedule />} />
            <Route path="exam-repository" element={<ExamRepository />} />

            {/* Assignments */}
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />

            {/* Fees */}
            <Route path="fees" element={<Fees />} />
            <Route path="fees/history" element={<PaymentHistory />} />

            {/* Library */}
            <Route path="library" element={<Library />} />

            {/* Messaging */}
            <Route path="messages" element={<MessagesInbox />} />
            <Route path="messages/:id" element={<MessageDetail />} />
            <Route path="messages/compose" element={<ComposeMessage />} />
            <Route path="messages/sent" element={<SentMessages />} />

            {/* Notifications */}
            <Route path="notifications" element={<StudentNotifications />} />

            {/* Campus life */}
            <Route path="events" element={<Events />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="news" element={<News />} />

            {/* Applications */}
            <Route path="reporting" element={<StudentReporting />} />
            <Route path="deferment/apply" element={<ApplyDeferment />} />
            <Route path="deferment" element={<DefermentList />} />
            <Route path="special-exam/apply" element={<ApplySpecialExam />} />
            <Route path="special-exam" element={<SpecialExamList />} />
            <Route path="clearance/request" element={<RequestClearance />} />
            <Route path="clearance" element={<ClearanceList />} />
          </Route>

          {/* ── Lecturer ── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={LECTURER_ROLES}>
                <LecturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="profile" element={<LecturerProfile />} />
            <Route path="timetable" element={<LecturerTimetable />} />

            {/* Units / Courses */}
            <Route path="units" element={<UnitDashboard />} />
            <Route path="units/:id" element={<CourseDetail />} />
            <Route path="curriculum" element={<Curriculum />} />

            {/* Grades */}
            <Route path="grade-entry" element={<GradeEntry />} />

            {/* Attendance */}
            <Route path="attendance" element={<AttendanceDashboard />} />
            <Route path="attendance/:id" element={<AttendanceDetail />} />
            <Route path="attendance/qr" element={<GenerateQRAttendance />} />

            {/* Assignments & Notes */}
            <Route path="assignments/create" element={<CreateAssignment />} />
            <Route path="notes/create" element={<CreateNotes />} />

            {/* Students */}
            <Route path="students" element={<MyStudents />} />

            {/* Support */}
            <Route path="support" element={<Support />} />
          </Route>

          {/* ── Finance ── */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <FinanceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FinanceDashboard />} />

            {/* Fee structures */}
            <Route path="fee-structures" element={<FinanceFeeStructureList />} />
            <Route path="fee-structures/add" element={<AddFeeStructure />} />
            <Route path="fee-structures/:id/edit" element={<EditFeeStructure />} />
            <Route path="fee-structures/programme/:id" element={<ProgrammeFeeDetail />} />

            {/* Payments */}
            <Route path="payments" element={<FeePaymentList />} />
            <Route path="payments/:id" element={<FeePaymentDetail />} />
          </Route>

          {/* ── COD (Chairman of Department) ── */}
          <Route
            path="/cod"
            element={
              <ProtectedRoute allowedRoles={['cod']}>
                <CodLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CodDashboard />} />
            <Route path="department" element={<DepartmentInfo />} />

            {/* Courses */}
            <Route path="courses" element={<CodCourses />} />
            <Route path="courses/assignments" element={<CourseAssignments />} />

            {/* Lecturers */}
            <Route path="lecturers" element={<CodLecturersList />} />
            <Route path="lecturers/:id" element={<CodLecturerDetail />} />

            {/* Students */}
            <Route path="students" element={<CodStudentsList />} />
            <Route path="students/:id" element={<CodStudentDetail />} />
            <Route path="students/:id/performance" element={<CodStudentPerformance />} />

            {/* Enrollments */}
            <Route path="enrollments" element={<EnrollmentsList />} />
            <Route path="enrollments/report" element={<EnrollmentReport />} />

            {/* Timetable */}
            <Route path="timetable" element={<TimetableDashboard />} />
            <Route path="timetable/create" element={<TimetableCreate />} />
            <Route path="timetable/view" element={<TimetableView />} />

            {/* Exams */}
            <Route path="exam-schedule" element={<CodExamSchedule />} />
            <Route path="exam-list" element={<GenerateExamList />} />
            <Route path="marks-approval" element={<MarksApproval />} />

            {/* Reports */}
            <Route path="performance-report" element={<PerformanceReport />} />
            <Route path="workload" element={<WorkloadAnalysis />} />

            {/* Programmes */}
            <Route path="programmes" element={<Programmes />} />

            {/* Research */}
            <Route path="research" element={<ResearchDashboard />} />
            <Route path="research/create" element={<ResearchCreate />} />
            <Route path="research/:id" element={<ResearchDetail />} />
            <Route path="research/:id/edit" element={<ResearchEdit />} />

            {/* Applications */}
            <Route path="deferments" element={<CodDefermentApplications />} />
            <Route path="special-exams" element={<CodSpecialExamApplications />} />
            <Route path="clearances" element={<CodClearanceRequests />} />
          </Route>

          {/* ── Dean ── */}
          <Route
            path="/dean"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <DeanLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DeanDashboard />} />
            <Route path="profile" element={<DeanProfile />} />

            {/* Departments */}
            <Route path="departments" element={<DepartmentsList />} />
            <Route path="departments/:id" element={<DepartmentDetail />} />

            {/* Programmes */}
            <Route path="programmes" element={<DeanProgrammes />} />
            <Route path="programmes/:id" element={<ProgrammeDetail />} />

            {/* Lecturers */}
            <Route path="lecturers" element={<DeanLecturerList />} />
            <Route path="lecturers/:id" element={<DeanLecturerDetail />} />
            <Route path="lecturers/:id/assignments" element={<LecturerAssignments />} />
            <Route path="allocate-courses" element={<AllocateCourses />} />
            <Route path="hods" element={<HodsManagement />} />

            {/* Students */}
            <Route path="students" element={<DeanStudentList />} />
            <Route path="students/:id" element={<DeanStudentDetail />} />
            <Route path="students/:id/performance" element={<DeanStudentPerformance />} />

            {/* Reports */}
            <Route path="reports" element={<DeanReport />} />
          </Route>

          {/* ── Hostel Warden ── */}
          <Route
            path="/hostel"
            element={
              <ProtectedRoute allowedRoles={['hostel_warden']}>
                <HostelLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HostelDashboard />} />

            {/* Hostels */}
            <Route path="hostels" element={<HostelList />} />

            {/* Rooms */}
            <Route path="rooms" element={<RoomList />} />
            <Route path="rooms/:id" element={<RoomManagement />} />

            {/* Beds */}
            <Route path="beds" element={<BedList />} />
            <Route path="beds/book" element={<BookBed />} />

            {/* Bookings */}
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="bookings/:id/cancel" element={<CancelBooking />} />
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
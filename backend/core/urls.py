"""
core_application/urls.py  —  All API endpoint routes
Every path here is mounted under /api/ by the root urls.py.
"""

from django.urls import path
from . import views

urlpatterns = [

    # ── AUTH ────────────────────────────────────────────────────────────────
    path('auth/login/',           views.LoginView.as_view(),          name='auth-login'),
    path('auth/logout/',          views.LogoutView.as_view(),         name='auth-logout'),
    path('auth/me/',              views.MeView.as_view(),             name='auth-me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),

    # ── USERS ───────────────────────────────────────────────────────────────
    path('users/',     views.UserListCreateView.as_view(),  name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),

    # ── FACULTIES ───────────────────────────────────────────────────────────
    path('faculties/',          views.FacultyListCreateView.as_view(), name='faculty-list'),
    path('faculties/<int:pk>/', views.FacultyDetailView.as_view(),     name='faculty-detail'),

    # ── DEPARTMENTS ─────────────────────────────────────────────────────────
    path('departments/',          views.DepartmentListCreateView.as_view(), name='department-list'),
    path('departments/<int:pk>/', views.DepartmentDetailView.as_view(),     name='department-detail'),

    # ── PROGRAMMES ──────────────────────────────────────────────────────────
    path('programmes/',          views.ProgrammeListCreateView.as_view(), name='programme-list'),
    path('programmes/<int:pk>/', views.ProgrammeDetailView.as_view(),     name='programme-detail'),

    # ── COURSES ─────────────────────────────────────────────────────────────
    path('courses/',          views.CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(),     name='course-detail'),

    # Programme ↔ Course mapping
    path('programme-courses/',          views.ProgrammeCourseListCreateView.as_view(), name='programme-course-list'),
    path('programme-courses/<int:pk>/', views.ProgrammeCourseDetailView.as_view(),     name='programme-course-detail'),

    # ── LECTURERS ───────────────────────────────────────────────────────────
    path('lecturers/',            views.LecturerListCreateView.as_view(), name='lecturer-list'),
    path('lecturers/<int:pk>/',   views.LecturerDetailView.as_view(),     name='lecturer-detail'),
    path('lecturers/me/',         views.LecturerProfileView.as_view(),    name='lecturer-profile'),

    # ── STUDENTS ────────────────────────────────────────────────────────────
    path('students/',                            views.StudentListCreateView.as_view(),     name='student-list'),
    path('students/<int:pk>/',                   views.StudentDetailView.as_view(),         name='student-detail'),
    path('students/me/',                         views.StudentProfileView.as_view(),        name='student-profile'),
    path('students/<int:pk>/balance/',           views.StudentBalanceView.as_view(),        name='student-balance'),
    path('students/<int:pk>/transcript/',        views.StudentTranscriptView.as_view(),     name='student-transcript'),
    path('students/<int:pk>/grades/',            views.StudentGradesView.as_view(),         name='student-grades'),
    path('students/<int:pk>/payment-history/',   views.StudentPaymentHistoryView.as_view(), name='student-payment-history'),
    path('students/<int:pk>/enrollments/',       views.StudentEnrollmentsView.as_view(),    name='student-enrollments'),
    path('students/<int:pk>/attendance/',        views.StudentAttendanceView.as_view(),     name='student-attendance'),
    path('students/<int:student_id>/attendance-summary/', views.StudentAttendanceSummaryView.as_view(), name='student-attendance-summary'),

    # ── STAFF ───────────────────────────────────────────────────────────────
    path('staff/',          views.StaffListCreateView.as_view(), name='staff-list'),
    path('staff/<int:pk>/', views.StaffDetailView.as_view(),     name='staff-detail'),

    # ── ACADEMIC YEARS ──────────────────────────────────────────────────────
    path('academic-years/',          views.AcademicYearListCreateView.as_view(), name='academic-year-list'),
    path('academic-years/<int:pk>/', views.AcademicYearDetailView.as_view(),     name='academic-year-detail'),

    # ── SEMESTERS ───────────────────────────────────────────────────────────
    path('semesters/',          views.SemesterListCreateView.as_view(), name='semester-list'),
    path('semesters/<int:pk>/', views.SemesterDetailView.as_view(),     name='semester-detail'),

    # ── STUDENT REPORTING ───────────────────────────────────────────────────
    path('student-reporting/',          views.StudentReportingListCreateView.as_view(), name='student-reporting-list'),
    path('student-reporting/<int:pk>/', views.StudentReportingDetailView.as_view(),     name='student-reporting-detail'),

    # ── ENROLLMENTS ─────────────────────────────────────────────────────────
    path('enrollments/',          views.EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', views.EnrollmentDetailView.as_view(),     name='enrollment-detail'),

    # ── GRADES ──────────────────────────────────────────────────────────────
    path('grades/',                views.GradeListCreateView.as_view(),  name='grade-list'),
    path('grades/<int:pk>/',       views.GradeDetailView.as_view(),      name='grade-detail'),
    path('grades/bulk/',           views.BulkGradeEntryView.as_view(),   name='grade-bulk'),
    path('grades/approve/',        views.MarksApprovalView.as_view(),    name='grade-approve'),

    # ── LECTURER COURSE ASSIGNMENTS ─────────────────────────────────────────
    path('lecturer-assignments/',          views.LecturerCourseAssignmentListCreateView.as_view(), name='lecturer-assignment-list'),
    path('lecturer-assignments/<int:pk>/', views.LecturerCourseAssignmentDetailView.as_view(),     name='lecturer-assignment-detail'),
    path('lecturer-assignments/my-units/', views.LecturerUnitsView.as_view(),                     name='lecturer-my-units'),

    # ── COURSE NOTES ────────────────────────────────────────────────────────
    path('course-notes/',                        views.CourseNotesListCreateView.as_view(), name='course-notes-list'),
    path('course-notes/<int:pk>/',               views.CourseNotesDetailView.as_view(),     name='course-notes-detail'),
    path('course-notes/<int:pk>/download/',      views.CourseNotesDownloadView.as_view(),   name='course-notes-download'),

    # ── ASSIGNMENTS ─────────────────────────────────────────────────────────
    path('assignments/',                           views.AssignmentListCreateView.as_view(),           name='assignment-list'),
    path('assignments/<int:pk>/',                  views.AssignmentDetailView.as_view(),               name='assignment-detail'),
    path('assignments/submissions/',               views.AssignmentSubmissionListCreateView.as_view(), name='assignment-submission-list'),
    path('assignments/submissions/<int:pk>/',      views.AssignmentSubmissionDetailView.as_view(),     name='assignment-submission-detail'),
    path('assignments/submissions/<int:pk>/grade/',views.GradeSubmissionView.as_view(),               name='assignment-submission-grade'),
    path('assignments/announcements/',             views.AssignmentAnnouncementListCreateView.as_view(), name='assignment-announcement-list'),
    path('assignments/announcements/<int:pk>/',    views.AssignmentAnnouncementDetailView.as_view(),     name='assignment-announcement-detail'),

    # ── EXAM REPOSITORY ─────────────────────────────────────────────────────
    path('exam-repository/',                     views.ExamRepositoryListCreateView.as_view(), name='exam-repository-list'),
    path('exam-repository/<int:pk>/',            views.ExamRepositoryDetailView.as_view(),     name='exam-repository-detail'),
    path('exam-repository/<int:pk>/download/',   views.ExamMaterialDownloadView.as_view(),     name='exam-material-download'),

    # ── SPECIAL EXAM APPLICATIONS ───────────────────────────────────────────
    path('special-exams/',          views.SpecialExamApplicationListCreateView.as_view(), name='special-exam-list'),
    path('special-exams/<int:pk>/', views.SpecialExamApplicationDetailView.as_view(),     name='special-exam-detail'),

    # ── DEFERMENT APPLICATIONS ──────────────────────────────────────────────
    path('deferments/',          views.DefermentApplicationListCreateView.as_view(), name='deferment-list'),
    path('deferments/<int:pk>/', views.DefermentApplicationDetailView.as_view(),     name='deferment-detail'),

    # ── CLEARANCE REQUESTS ──────────────────────────────────────────────────
    path('clearances/',          views.ClearanceRequestListCreateView.as_view(), name='clearance-list'),
    path('clearances/<int:pk>/', views.ClearanceRequestDetailView.as_view(),     name='clearance-detail'),

    # ── MESSAGES ────────────────────────────────────────────────────────────
    path('messages/',          views.MessageListCreateView.as_view(),  name='message-list'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(),      name='message-detail'),
    path('messages/threads/',  views.MessageThreadListView.as_view(),  name='message-threads'),

    # ── STUDENT NOTIFICATIONS ───────────────────────────────────────────────
    path('student-notifications/',                      views.StudentNotificationListView.as_view(),   name='student-notification-list'),
    path('student-notifications/<int:pk>/',             views.StudentNotificationDetailView.as_view(), name='student-notification-detail'),
    path('student-notifications/<int:pk>/mark-read/',   views.MarkNotificationReadView.as_view(),      name='student-notification-read'),

    # ── FEE STRUCTURES ──────────────────────────────────────────────────────
    path('fee-structures/',          views.FeeStructureListCreateView.as_view(), name='fee-structure-list'),
    path('fee-structures/<int:pk>/', views.FeeStructureDetailView.as_view(),     name='fee-structure-detail'),

    # ── FEE PAYMENTS ────────────────────────────────────────────────────────
    path('payments/',          views.FeePaymentListCreateView.as_view(), name='payment-list'),
    path('payments/<int:pk>/', views.FeePaymentDetailView.as_view(),     name='payment-detail'),

    # ── RESEARCH ────────────────────────────────────────────────────────────
    path('research/',          views.ResearchListCreateView.as_view(), name='research-list'),
    path('research/<int:pk>/', views.ResearchDetailView.as_view(),     name='research-detail'),

    # ── LIBRARY ─────────────────────────────────────────────────────────────
    path('library/',                      views.LibraryListCreateView.as_view(),            name='library-list'),
    path('library/<int:pk>/',             views.LibraryDetailView.as_view(),                name='library-detail'),
    path('library/transactions/',         views.LibraryTransactionListCreateView.as_view(), name='library-transaction-list'),
    path('library/transactions/<int:pk>/',views.LibraryTransactionDetailView.as_view(),     name='library-transaction-detail'),

    # ── HOSTELS ─────────────────────────────────────────────────────────────
    path('hostels/',                     views.HostelListCreateView.as_view(),        name='hostel-list'),
    path('hostels/<int:pk>/',            views.HostelDetailView.as_view(),            name='hostel-detail'),
    path('hostels/<int:pk>/rooms/',      views.HostelRoomsView.as_view(),             name='hostel-rooms'),
    path('rooms/',                       views.RoomListCreateView.as_view(),          name='room-list'),
    path('rooms/<int:pk>/',              views.RoomDetailView.as_view(),              name='room-detail'),
    path('rooms/<int:pk>/beds/',         views.RoomBedsView.as_view(),               name='room-beds'),
    path('beds/',                        views.BedListCreateView.as_view(),           name='bed-list'),
    path('beds/<int:pk>/',               views.BedDetailView.as_view(),              name='bed-detail'),
    path('hostel-bookings/',             views.HostelBookingListCreateView.as_view(), name='hostel-booking-list'),
    path('hostel-bookings/<int:pk>/',    views.HostelBookingDetailView.as_view(),     name='hostel-booking-detail'),
    path('hostel-payments/',             views.HostelPaymentListCreateView.as_view(), name='hostel-payment-list'),
    path('hostel-payments/<int:pk>/',    views.HostelPaymentDetailView.as_view(),     name='hostel-payment-detail'),
    path('hostel-incidents/',            views.HostelIncidentListCreateView.as_view(), name='hostel-incident-list'),
    path('hostel-incidents/<int:pk>/',   views.HostelIncidentDetailView.as_view(),     name='hostel-incident-detail'),

    # ── EXAMINATIONS ────────────────────────────────────────────────────────
    path('examinations/',          views.ExaminationListCreateView.as_view(), name='examination-list'),
    path('examinations/<int:pk>/', views.ExaminationDetailView.as_view(),     name='examination-detail'),

    # ── TIMETABLE ───────────────────────────────────────────────────────────
    path('timetable/',          views.TimetableListCreateView.as_view(), name='timetable-list'),
    path('timetable/<int:pk>/', views.TimetableDetailView.as_view(),     name='timetable-detail'),

    # ── ATTENDANCE ──────────────────────────────────────────────────────────
    path('attendance/sessions/',                      views.AttendanceSessionListCreateView.as_view(),  name='attendance-session-list'),
    path('attendance/sessions/<int:pk>/',             views.AttendanceSessionDetailView.as_view(),      name='attendance-session-detail'),
    path('attendance/sessions/token/<str:token>/',    views.AttendanceSessionByTokenView.as_view(),     name='attendance-session-by-token'),
    path('attendance/mark/',                          views.MarkAttendanceView.as_view(),               name='attendance-mark'),
    path('attendance/',                               views.AttendanceListCreateView.as_view(),         name='attendance-list'),
    path('attendance/<int:pk>/',                      views.AttendanceDetailView.as_view(),             name='attendance-detail'),

    # ── SYSTEM NOTIFICATIONS ────────────────────────────────────────────────
    path('notifications/',          views.NotificationListCreateView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(),     name='notification-detail'),

    # ── NEWS ────────────────────────────────────────────────────────────────
    path('news/',          views.NewsArticleListCreateView.as_view(), name='news-list'),
    path('news/<int:pk>/', views.NewsArticleDetailView.as_view(),     name='news-detail'),

    # ── STUDENT COMMENTS ────────────────────────────────────────────────────
    path('student-comments/',          views.StudentCommentListCreateView.as_view(), name='student-comment-list'),
    path('student-comments/<int:pk>/', views.StudentCommentDetailView.as_view(),     name='student-comment-detail'),

    # ── FAQ & QUICK LINKS ───────────────────────────────────────────────────
    path('faq/',             views.CommonQuestionListCreateView.as_view(), name='faq-list'),
    path('faq/<int:pk>/',    views.CommonQuestionDetailView.as_view(),     name='faq-detail'),
    path('quick-links/',          views.QuickLinkListCreateView.as_view(), name='quick-link-list'),
    path('quick-links/<int:pk>/', views.QuickLinkDetailView.as_view(),     name='quick-link-detail'),

    # ── CLUBS & EVENTS ──────────────────────────────────────────────────────
    path('clubs/',                    views.StudentClubListCreateView.as_view(),     name='club-list'),
    path('clubs/<int:pk>/',           views.StudentClubDetailView.as_view(),         name='club-detail'),
    path('club-memberships/',         views.ClubMembershipListCreateView.as_view(),  name='club-membership-list'),
    path('club-memberships/<int:pk>/',views.ClubMembershipDetailView.as_view(),      name='club-membership-detail'),
    path('club-events/',              views.ClubEventListCreateView.as_view(),       name='club-event-list'),
    path('club-events/<int:pk>/',     views.ClubEventDetailView.as_view(),           name='club-event-detail'),
    path('events/',                   views.EventListCreateView.as_view(),           name='event-list'),
    path('events/<int:pk>/',          views.EventDetailView.as_view(),               name='event-detail'),
    path('event-registrations/',      views.EventRegistrationListCreateView.as_view(), name='event-registration-list'),
    path('event-registrations/<int:pk>/', views.EventRegistrationDetailView.as_view(), name='event-registration-detail'),

    # ── ANALYTICS ───────────────────────────────────────────────────────────
    path('analytics/dashboard/',     views.DashboardAnalyticsView.as_view(),  name='analytics-dashboard'),
    path('analytics/metrics/',       views.SystemMetricsView.as_view(),       name='analytics-metrics'),
    path('analytics/activity-log/',  views.ActivityLogListView.as_view(),     name='analytics-activity-log'),
    path('analytics/page-visits/',   views.PageVisitListView.as_view(),       name='analytics-page-visits'),

    # ── SECURITY ────────────────────────────────────────────────────────────
    path('security/login-attempts/',        views.AdminLoginAttemptListView.as_view(),      name='security-login-attempts'),
    path('security/alerts/',                views.AdminSecurityAlertListView.as_view(),     name='security-alerts'),
    path('security/alerts/<int:pk>/',       views.AdminSecurityAlertDetailView.as_view(),   name='security-alert-detail'),

    # ── REPORTING ───────────────────────────────────────────────────────────
    path('reports/enrollment/',   views.EnrollmentReportView.as_view(),   name='report-enrollment'),
    path('reports/performance/',  views.PerformanceReportView.as_view(),  name='report-performance'),
    path('reports/workload/',     views.WorkloadAnalysisView.as_view(),   name='report-workload'),
    path('reports/finance/',      views.FinancialSummaryView.as_view(),   name='report-finance'),

    # ── PAYMENT WEBHOOKS ────────────────────────────────────────────────────
    path('webhooks/equity/', views.EquityWebhookView.as_view(), name='webhook-equity'),
    path('webhooks/kcb/',    views.KCBWebhookView.as_view(),    name='webhook-kcb'),
    path('webhooks/mpesa/',  views.MpesaWebhookView.as_view(),  name='webhook-mpesa'),
]
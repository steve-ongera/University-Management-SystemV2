/**
 * api.js — Unified API layer for University ERP
 * Covers every endpoint defined in core_application/urls.py
 *
 * Usage:
 *   import api, { auth, students, courses, ... } from './api/api';
 *
 * The default export is the raw axios instance (for one-off calls).
 * Each named export is a group of helpers for a resource.
 */

import axios from 'axios';

// ─────────────────────────────────────────────
// BASE AXIOS INSTANCE
// ─────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Global response error handler — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Strip undefined / null / '' from a params object before sending */
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

/** Build FormData from an object (for file uploads) */
const toFormData = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
};

// ─────────────────────────────────────────────
// AUTH  —  POST /api/auth/*
// ─────────────────────────────────────────────

export const auth = {
  /** POST /api/auth/login/ */
  login: (credentials) => api.post('/auth/login/', credentials),

  /** POST /api/auth/logout/ */
  logout: () => api.post('/auth/logout/'),

  /** GET /api/auth/me/ */
  me: () => api.get('/auth/me/'),

  /** PATCH /api/auth/me/ */
  updateMe: (data) => api.patch('/auth/me/', data),

  /** POST /api/auth/change-password/ */
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// ─────────────────────────────────────────────
// USERS  —  /api/users/
// ─────────────────────────────────────────────

export const users = {
  /** GET /api/users/ */
  list: (params) => api.get('/users/', { params: clean(params) }),

  /** POST /api/users/ */
  create: (data) => api.post('/users/', data),

  /** GET /api/users/:id/ */
  get: (id) => api.get(`/users/${id}/`),

  /** PUT /api/users/:id/ */
  update: (id, data) => api.put(`/users/${id}/`, data),

  /** PATCH /api/users/:id/ */
  patch: (id, data) => api.patch(`/users/${id}/`, data),

  /** DELETE /api/users/:id/ */
  delete: (id) => api.delete(`/users/${id}/`),
};

// ─────────────────────────────────────────────
// FACULTIES  —  /api/faculties/
// ─────────────────────────────────────────────

export const faculties = {
  list: () => api.get('/faculties/'),
  create: (data) => api.post('/faculties/', data),
  get: (id) => api.get(`/faculties/${id}/`),
  update: (id, data) => api.put(`/faculties/${id}/`, data),
  patch: (id, data) => api.patch(`/faculties/${id}/`, data),
  delete: (id) => api.delete(`/faculties/${id}/`),
};

// ─────────────────────────────────────────────
// DEPARTMENTS  —  /api/departments/
// ─────────────────────────────────────────────

export const departments = {
  /** GET /api/departments/?faculty=<id> */
  list: (params) => api.get('/departments/', { params: clean(params) }),
  create: (data) => api.post('/departments/', data),
  get: (id) => api.get(`/departments/${id}/`),
  update: (id, data) => api.put(`/departments/${id}/`, data),
  patch: (id, data) => api.patch(`/departments/${id}/`, data),
  delete: (id) => api.delete(`/departments/${id}/`),
};

// ─────────────────────────────────────────────
// PROGRAMMES  —  /api/programmes/
// ─────────────────────────────────────────────

export const programmes = {
  /** GET /api/programmes/?department=&faculty=&programme_type= */
  list: (params) => api.get('/programmes/', { params: clean(params) }),
  create: (data) => api.post('/programmes/', data),
  get: (id) => api.get(`/programmes/${id}/`),
  update: (id, data) => api.put(`/programmes/${id}/`, data),
  patch: (id, data) => api.patch(`/programmes/${id}/`, data),
  delete: (id) => api.delete(`/programmes/${id}/`),
};

// ─────────────────────────────────────────────
// COURSES  —  /api/courses/  &  /api/programme-courses/
// ─────────────────────────────────────────────

export const courses = {
  /** GET /api/courses/?department=&level=&course_type=&search= */
  list: (params) => api.get('/courses/', { params: clean(params) }),
  create: (data) => api.post('/courses/', data),
  get: (id) => api.get(`/courses/${id}/`),
  update: (id, data) => api.put(`/courses/${id}/`, data),
  patch: (id, data) => api.patch(`/courses/${id}/`, data),
  delete: (id) => api.delete(`/courses/${id}/`),

  // Programme ↔ Course mappings
  /** GET /api/programme-courses/?programme=&year=&semester= */
  programmeCourseList: (params) =>
    api.get('/programme-courses/', { params: clean(params) }),
  programmeCourseCreate: (data) => api.post('/programme-courses/', data),
  programmeCourseGet: (id) => api.get(`/programme-courses/${id}/`),
  programmeCourseUpdate: (id, data) =>
    api.put(`/programme-courses/${id}/`, data),
  programmeCourseDelete: (id) => api.delete(`/programme-courses/${id}/`),
};

// ─────────────────────────────────────────────
// LECTURERS  —  /api/lecturers/
// ─────────────────────────────────────────────

export const lecturers = {
  /** GET /api/lecturers/?department=&rank=&search= */
  list: (params) => api.get('/lecturers/', { params: clean(params) }),
  create: (data) => api.post('/lecturers/', data),
  get: (id) => api.get(`/lecturers/${id}/`),
  update: (id, data) => api.put(`/lecturers/${id}/`, data),
  patch: (id, data) => api.patch(`/lecturers/${id}/`, data),
  delete: (id) => api.delete(`/lecturers/${id}/`),

  /** GET /api/lecturers/me/ — authenticated lecturer's own profile */
  myProfile: () => api.get('/lecturers/me/'),

  /** PATCH /api/lecturers/me/ */
  updateMyProfile: (data) => api.patch('/lecturers/me/', data),

  // Course assignments for the authenticated lecturer
  /** GET /api/lecturer-assignments/my-units/ */
  myUnits: () => api.get('/lecturer-assignments/my-units/'),

  // Lecturer course assignments (admin / COD)
  /** GET /api/lecturer-assignments/?lecturer=&course=&semester=&academic_year= */
  assignmentList: (params) =>
    api.get('/lecturer-assignments/', { params: clean(params) }),
  assignmentCreate: (data) => api.post('/lecturer-assignments/', data),
  assignmentGet: (id) => api.get(`/lecturer-assignments/${id}/`),
  assignmentUpdate: (id, data) =>
    api.put(`/lecturer-assignments/${id}/`, data),
  assignmentDelete: (id) => api.delete(`/lecturer-assignments/${id}/`),
};

// ─────────────────────────────────────────────
// STUDENTS  —  /api/students/
// ─────────────────────────────────────────────

export const students = {
  /** GET /api/students/?programme=&year=&status=&department=&search= */
  list: (params) => api.get('/students/', { params: clean(params) }),
  create: (data) => api.post('/students/', data),
  get: (id) => api.get(`/students/${id}/`),
  update: (id, data) => api.put(`/students/${id}/`, data),
  patch: (id, data) => api.patch(`/students/${id}/`, data),
  delete: (id) => api.delete(`/students/${id}/`),

  /** GET /api/students/me/ — authenticated student's own profile */
  myProfile: () => api.get('/students/me/'),
  updateMyProfile: (data) => api.patch('/students/me/', data),

  /** GET /api/students/:id/balance/ */
  balance: (id) => api.get(`/students/${id}/balance/`),

  /** GET /api/students/:id/transcript/ */
  transcript: (id) => api.get(`/students/${id}/transcript/`),

  /** GET /api/students/:id/grades/ */
  grades: (id) => api.get(`/students/${id}/grades/`),

  /** GET /api/students/:id/payment-history/ */
  paymentHistory: (id) => api.get(`/students/${id}/payment-history/`),

  /** GET /api/students/:id/enrollments/?semester= */
  enrollments: (id, params) =>
    api.get(`/students/${id}/enrollments/`, { params: clean(params) }),

  /** GET /api/students/:id/attendance/ */
  attendance: (id) => api.get(`/students/${id}/attendance/`),

  /** GET /api/students/:id/attendance-summary/ */
  attendanceSummary: (id) =>
    api.get(`/students/${id}/attendance-summary/`),
};

// ─────────────────────────────────────────────
// STAFF  —  /api/staff/
// ─────────────────────────────────────────────

export const staff = {
  /** GET /api/staff/?department=&category= */
  list: (params) => api.get('/staff/', { params: clean(params) }),
  create: (data) => api.post('/staff/', data),
  get: (id) => api.get(`/staff/${id}/`),
  update: (id, data) => api.put(`/staff/${id}/`, data),
  patch: (id, data) => api.patch(`/staff/${id}/`, data),
  delete: (id) => api.delete(`/staff/${id}/`),
};

// ─────────────────────────────────────────────
// ACADEMIC YEARS & SEMESTERS
// ─────────────────────────────────────────────

export const academicYears = {
  list: () => api.get('/academic-years/'),
  create: (data) => api.post('/academic-years/', data),
  get: (id) => api.get(`/academic-years/${id}/`),
  update: (id, data) => api.put(`/academic-years/${id}/`, data),
  delete: (id) => api.delete(`/academic-years/${id}/`),
};

export const semesters = {
  /** GET /api/semesters/?academic_year= */
  list: (params) => api.get('/semesters/', { params: clean(params) }),
  create: (data) => api.post('/semesters/', data),
  get: (id) => api.get(`/semesters/${id}/`),
  update: (id, data) => api.put(`/semesters/${id}/`, data),
  delete: (id) => api.delete(`/semesters/${id}/`),
};

// ─────────────────────────────────────────────
// STUDENT REPORTING  —  /api/student-reporting/
// ─────────────────────────────────────────────

export const studentReporting = {
  /** GET /api/student-reporting/?student=&semester=&status= */
  list: (params) => api.get('/student-reporting/', { params: clean(params) }),
  create: (data) => api.post('/student-reporting/', data),
  get: (id) => api.get(`/student-reporting/${id}/`),
  update: (id, data) => api.put(`/student-reporting/${id}/`, data),
  patch: (id, data) => api.patch(`/student-reporting/${id}/`, data),
  delete: (id) => api.delete(`/student-reporting/${id}/`),
};

// ─────────────────────────────────────────────
// ENROLLMENTS  —  /api/enrollments/
// ─────────────────────────────────────────────

export const enrollments = {
  /** GET /api/enrollments/?student=&course=&semester=&lecturer= */
  list: (params) => api.get('/enrollments/', { params: clean(params) }),
  create: (data) => api.post('/enrollments/', data),
  get: (id) => api.get(`/enrollments/${id}/`),
  update: (id, data) => api.put(`/enrollments/${id}/`, data),
  delete: (id) => api.delete(`/enrollments/${id}/`),
};

// ─────────────────────────────────────────────
// GRADES  —  /api/grades/
// ─────────────────────────────────────────────

export const grades = {
  /** GET /api/grades/?student=&course=&semester= */
  list: (params) => api.get('/grades/', { params: clean(params) }),
  create: (data) => api.post('/grades/', data),
  get: (id) => api.get(`/grades/${id}/`),
  update: (id, data) => api.put(`/grades/${id}/`, data),
  patch: (id, data) => api.patch(`/grades/${id}/`, data),
  delete: (id) => api.delete(`/grades/${id}/`),

  /** POST /api/grades/bulk/ — { grades: [...] } */
  bulk: (data) => api.post('/grades/bulk/', data),

  /** POST /api/grades/approve/ — { course, semester } */
  approve: (data) => api.post('/grades/approve/', data),
};

// ─────────────────────────────────────────────
// COURSE NOTES  —  /api/course-notes/
// ─────────────────────────────────────────────

export const courseNotes = {
  /** GET /api/course-notes/?assignment=&course= */
  list: (params) => api.get('/course-notes/', { params: clean(params) }),

  /** POST /api/course-notes/ — supports file uploads */
  create: (data) =>
    api.post('/course-notes/', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  get: (id) => api.get(`/course-notes/${id}/`),
  update: (id, data) =>
    api.put(`/course-notes/${id}/`, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  patch: (id, data) => api.patch(`/course-notes/${id}/`, data),
  delete: (id) => api.delete(`/course-notes/${id}/`),

  /** POST /api/course-notes/:id/download/ */
  download: (id) => api.post(`/course-notes/${id}/download/`),
};

// ─────────────────────────────────────────────
// ASSIGNMENTS  —  /api/assignments/
// ─────────────────────────────────────────────

export const assignments = {
  /** GET /api/assignments/?lecturer_assignment=&course=&published= */
  list: (params) => api.get('/assignments/', { params: clean(params) }),
  create: (data) =>
    api.post('/assignments/', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (id) => api.get(`/assignments/${id}/`),
  update: (id, data) =>
    api.put(`/assignments/${id}/`, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  patch: (id, data) => api.patch(`/assignments/${id}/`, data),
  delete: (id) => api.delete(`/assignments/${id}/`),

  // Submissions
  /** GET /api/assignments/submissions/?assignment=&student=&grading_status= */
  submissionList: (params) =>
    api.get('/assignments/submissions/', { params: clean(params) }),
  submissionCreate: (data) =>
    api.post('/assignments/submissions/', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submissionGet: (id) => api.get(`/assignments/submissions/${id}/`),
  submissionUpdate: (id, data) =>
    api.put(`/assignments/submissions/${id}/`, data),
  submissionDelete: (id) => api.delete(`/assignments/submissions/${id}/`),

  /** PATCH /api/assignments/submissions/:id/grade/ — { marks_obtained, lecturer_feedback } */
  gradeSubmission: (id, data) =>
    api.patch(`/assignments/submissions/${id}/grade/`, data),

  // Announcements
  /** GET /api/assignments/announcements/?assignment= */
  announcementList: (params) =>
    api.get('/assignments/announcements/', { params: clean(params) }),
  announcementCreate: (data) => api.post('/assignments/announcements/', data),
  announcementGet: (id) => api.get(`/assignments/announcements/${id}/`),
  announcementUpdate: (id, data) =>
    api.put(`/assignments/announcements/${id}/`, data),
  announcementDelete: (id) =>
    api.delete(`/assignments/announcements/${id}/`),
};

// ─────────────────────────────────────────────
// EXAM REPOSITORY  —  /api/exam-repository/
// ─────────────────────────────────────────────

export const examRepository = {
  /** GET /api/exam-repository/?course=&programme=&material_type=&academic_year= */
  list: (params) => api.get('/exam-repository/', { params: clean(params) }),
  create: (data) =>
    api.post('/exam-repository/', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (id) => api.get(`/exam-repository/${id}/`),
  update: (id, data) =>
    api.put(`/exam-repository/${id}/`, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/exam-repository/${id}/`),

  /** POST /api/exam-repository/:id/download/ */
  download: (id) => api.post(`/exam-repository/${id}/download/`),
};

// ─────────────────────────────────────────────
// SPECIAL EXAM APPLICATIONS  —  /api/special-exams/
// ─────────────────────────────────────────────

export const specialExams = {
  /** GET /api/special-exams/?student=&status=&semester= */
  list: (params) => api.get('/special-exams/', { params: clean(params) }),
  create: (data) => api.post('/special-exams/', data),
  get: (id) => api.get(`/special-exams/${id}/`),
  update: (id, data) => api.put(`/special-exams/${id}/`, data),
  patch: (id, data) => api.patch(`/special-exams/${id}/`, data),
  delete: (id) => api.delete(`/special-exams/${id}/`),
};

// ─────────────────────────────────────────────
// DEFERMENT APPLICATIONS  —  /api/deferments/
// ─────────────────────────────────────────────

export const deferments = {
  /** GET /api/deferments/?student=&status= */
  list: (params) => api.get('/deferments/', { params: clean(params) }),
  create: (data) => api.post('/deferments/', data),
  get: (id) => api.get(`/deferments/${id}/`),
  update: (id, data) => api.put(`/deferments/${id}/`, data),
  patch: (id, data) => api.patch(`/deferments/${id}/`, data),
  delete: (id) => api.delete(`/deferments/${id}/`),
};

// ─────────────────────────────────────────────
// CLEARANCE REQUESTS  —  /api/clearances/
// ─────────────────────────────────────────────

export const clearances = {
  /** GET /api/clearances/?student=&clearance_type=&status= */
  list: (params) => api.get('/clearances/', { params: clean(params) }),
  create: (data) => api.post('/clearances/', data),
  get: (id) => api.get(`/clearances/${id}/`),
  update: (id, data) => api.put(`/clearances/${id}/`, data),
  patch: (id, data) => api.patch(`/clearances/${id}/`, data),
  delete: (id) => api.delete(`/clearances/${id}/`),
};

// ─────────────────────────────────────────────
// MESSAGES  —  /api/messages/
// ─────────────────────────────────────────────

export const messages = {
  /** GET /api/messages/?box=inbox|sent */
  list: (params) => api.get('/messages/', { params: clean(params) }),
  send: (data) => api.post('/messages/', data),
  get: (id) => api.get(`/messages/${id}/`),
  update: (id, data) => api.put(`/messages/${id}/`, data),
  delete: (id) => api.delete(`/messages/${id}/`),

  /** GET /api/messages/threads/ */
  threads: () => api.get('/messages/threads/'),
};

// ─────────────────────────────────────────────
// NOTIFICATIONS (student-level)  —  /api/student-notifications/
// ─────────────────────────────────────────────

export const studentNotifications = {
  list: () => api.get('/student-notifications/'),
  get: (id) => api.get(`/student-notifications/${id}/`),

  /** POST /api/student-notifications/:id/mark-read/ */
  markRead: (id) => api.post(`/student-notifications/${id}/mark-read/`),
};

// ─────────────────────────────────────────────
// NOTIFICATIONS (system-wide)  —  /api/notifications/
// ─────────────────────────────────────────────

export const notifications = {
  /** GET /api/notifications/?type= */
  list: (params) => api.get('/notifications/', { params: clean(params) }),
  create: (data) => api.post('/notifications/', data),
  get: (id) => api.get(`/notifications/${id}/`),
  update: (id, data) => api.put(`/notifications/${id}/`, data),
  delete: (id) => api.delete(`/notifications/${id}/`),
};

// ─────────────────────────────────────────────
// FEES  —  /api/fee-structures/  &  /api/payments/
// ─────────────────────────────────────────────

export const fees = {
  // Fee Structures
  /** GET /api/fee-structures/?programme=&academic_year=&year=&semester= */
  structureList: (params) =>
    api.get('/fee-structures/', { params: clean(params) }),
  structureCreate: (data) => api.post('/fee-structures/', data),
  structureGet: (id) => api.get(`/fee-structures/${id}/`),
  structureUpdate: (id, data) => api.put(`/fee-structures/${id}/`, data),
  structurePatch: (id, data) => api.patch(`/fee-structures/${id}/`, data),
  structureDelete: (id) => api.delete(`/fee-structures/${id}/`),

  // Fee Payments
  /** GET /api/payments/?student=&method=&status=&from_date=&to_date= */
  paymentList: (params) =>
    api.get('/payments/', { params: clean(params) }),
  paymentCreate: (data) => api.post('/payments/', data),
  paymentGet: (id) => api.get(`/payments/${id}/`),
  paymentUpdate: (id, data) => api.put(`/payments/${id}/`, data),
};

// ─────────────────────────────────────────────
// RESEARCH  —  /api/research/
// ─────────────────────────────────────────────

export const research = {
  /** GET /api/research/?department=&research_type=&status=&lecturer= */
  list: (params) => api.get('/research/', { params: clean(params) }),
  create: (data) => api.post('/research/', data),
  get: (id) => api.get(`/research/${id}/`),
  update: (id, data) => api.put(`/research/${id}/`, data),
  patch: (id, data) => api.patch(`/research/${id}/`, data),
  delete: (id) => api.delete(`/research/${id}/`),
};

// ─────────────────────────────────────────────
// LIBRARY  —  /api/library/
// ─────────────────────────────────────────────

export const library = {
  /** GET /api/library/?resource_type=&available=&subject_area=&search= */
  list: (params) => api.get('/library/', { params: clean(params) }),
  create: (data) => api.post('/library/', data),
  get: (id) => api.get(`/library/${id}/`),
  update: (id, data) => api.put(`/library/${id}/`, data),
  patch: (id, data) => api.patch(`/library/${id}/`, data),
  delete: (id) => api.delete(`/library/${id}/`),

  // Transactions
  /** GET /api/library/transactions/?user=&status=&transaction_type= */
  transactionList: (params) =>
    api.get('/library/transactions/', { params: clean(params) }),
  transactionCreate: (data) => api.post('/library/transactions/', data),
  transactionGet: (id) => api.get(`/library/transactions/${id}/`),
  transactionUpdate: (id, data) =>
    api.put(`/library/transactions/${id}/`, data),
};

// ─────────────────────────────────────────────
// HOSTELS  —  /api/hostels/
// ─────────────────────────────────────────────

export const hostels = {
  /** GET /api/hostels/?hostel_type= */
  list: (params) => api.get('/hostels/', { params: clean(params) }),
  create: (data) => api.post('/hostels/', data),
  get: (id) => api.get(`/hostels/${id}/`),
  update: (id, data) => api.put(`/hostels/${id}/`, data),
  delete: (id) => api.delete(`/hostels/${id}/`),

  /** GET /api/hostels/:id/rooms/ */
  rooms: (hostelId) => api.get(`/hostels/${hostelId}/rooms/`),

  // Rooms
  /** GET /api/rooms/?hostel=&floor= */
  roomList: (params) => api.get('/rooms/', { params: clean(params) }),
  roomCreate: (data) => api.post('/rooms/', data),
  roomGet: (id) => api.get(`/rooms/${id}/`),
  roomUpdate: (id, data) => api.put(`/rooms/${id}/`, data),
  roomDelete: (id) => api.delete(`/rooms/${id}/`),

  /** GET /api/rooms/:id/beds/ */
  roomBeds: (roomId) => api.get(`/rooms/${roomId}/beds/`),

  // Beds
  /** GET /api/beds/?room=&academic_year=&available= */
  bedList: (params) => api.get('/beds/', { params: clean(params) }),
  bedCreate: (data) => api.post('/beds/', data),
  bedGet: (id) => api.get(`/beds/${id}/`),
  bedUpdate: (id, data) => api.put(`/beds/${id}/`, data),
  bedDelete: (id) => api.delete(`/beds/${id}/`),

  // Bookings
  /** GET /api/hostel-bookings/?student=&academic_year=&booking_status=&hostel= */
  bookingList: (params) =>
    api.get('/hostel-bookings/', { params: clean(params) }),
  bookingCreate: (data) => api.post('/hostel-bookings/', data),
  bookingGet: (id) => api.get(`/hostel-bookings/${id}/`),
  bookingUpdate: (id, data) => api.put(`/hostel-bookings/${id}/`, data),
  bookingPatch: (id, data) => api.patch(`/hostel-bookings/${id}/`, data),
  bookingDelete: (id) => api.delete(`/hostel-bookings/${id}/`),

  // Hostel Payments
  /** GET /api/hostel-payments/?booking= */
  paymentList: (params) =>
    api.get('/hostel-payments/', { params: clean(params) }),
  paymentCreate: (data) => api.post('/hostel-payments/', data),
  paymentGet: (id) => api.get(`/hostel-payments/${id}/`),

  // Incidents
  /** GET /api/hostel-incidents/?booking=&incident_type=&status= */
  incidentList: (params) =>
    api.get('/hostel-incidents/', { params: clean(params) }),
  incidentCreate: (data) => api.post('/hostel-incidents/', data),
  incidentGet: (id) => api.get(`/hostel-incidents/${id}/`),
  incidentUpdate: (id, data) => api.put(`/hostel-incidents/${id}/`, data),
  incidentDelete: (id) => api.delete(`/hostel-incidents/${id}/`),
};

// ─────────────────────────────────────────────
// EXAMINATIONS  —  /api/examinations/
// ─────────────────────────────────────────────

export const examinations = {
  /** GET /api/examinations/?course=&semester=&exam_type=&published= */
  list: (params) => api.get('/examinations/', { params: clean(params) }),
  create: (data) => api.post('/examinations/', data),
  get: (id) => api.get(`/examinations/${id}/`),
  update: (id, data) => api.put(`/examinations/${id}/`, data),
  patch: (id, data) => api.patch(`/examinations/${id}/`, data),
  delete: (id) => api.delete(`/examinations/${id}/`),
};

// ─────────────────────────────────────────────
// TIMETABLE  —  /api/timetable/
// ─────────────────────────────────────────────

export const timetable = {
  /** GET /api/timetable/?semester=&programme=&lecturer=&year=&day= */
  list: (params) => api.get('/timetable/', { params: clean(params) }),
  create: (data) => api.post('/timetable/', data),
  get: (id) => api.get(`/timetable/${id}/`),
  update: (id, data) => api.put(`/timetable/${id}/`, data),
  patch: (id, data) => api.patch(`/timetable/${id}/`, data),
  delete: (id) => api.delete(`/timetable/${id}/`),
};

// ─────────────────────────────────────────────
// ATTENDANCE  —  /api/attendance/
// ─────────────────────────────────────────────

export const attendance = {
  // Sessions (lecturer creates)
  /** GET /api/attendance/sessions/?lecturer=&semester=&timetable_slot= */
  sessionList: (params) =>
    api.get('/attendance/sessions/', { params: clean(params) }),
  sessionCreate: (data) => api.post('/attendance/sessions/', data),
  sessionGet: (id) => api.get(`/attendance/sessions/${id}/`),
  sessionUpdate: (id, data) =>
    api.put(`/attendance/sessions/${id}/`, data),
  sessionDelete: (id) => api.delete(`/attendance/sessions/${id}/`),

  /** GET /api/attendance/sessions/token/:token/ — scan QR */
  sessionByToken: (token) =>
    api.get(`/attendance/sessions/token/${token}/`),

  /** POST /api/attendance/mark/ — { token } */
  mark: (data) => api.post('/attendance/mark/', data),

  // Attendance records (admin / lecturer view)
  /** GET /api/attendance/?student=&course=&session=&week= */
  list: (params) => api.get('/attendance/', { params: clean(params) }),
  create: (data) => api.post('/attendance/', data),
  get: (id) => api.get(`/attendance/${id}/`),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  delete: (id) => api.delete(`/attendance/${id}/`),
};

// ─────────────────────────────────────────────
// NEWS  —  /api/news/
// ─────────────────────────────────────────────

export const news = {
  /** GET /api/news/?category=&published= */
  list: (params) => api.get('/news/', { params: clean(params) }),
  create: (data) =>
    api.post('/news/', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (id) => api.get(`/news/${id}/`),
  update: (id, data) => api.put(`/news/${id}/`, data),
  delete: (id) => api.delete(`/news/${id}/`),
};

// ─────────────────────────────────────────────
// STUDENT COMMENTS  —  /api/student-comments/
// ─────────────────────────────────────────────

export const studentComments = {
  /** GET /api/student-comments/?resolved= */
  list: (params) =>
    api.get('/student-comments/', { params: clean(params) }),
  create: (data) => api.post('/student-comments/', data),
  get: (id) => api.get(`/student-comments/${id}/`),
  update: (id, data) => api.put(`/student-comments/${id}/`, data),
  delete: (id) => api.delete(`/student-comments/${id}/`),
};

// ─────────────────────────────────────────────
// FAQ & QUICK LINKS
// ─────────────────────────────────────────────

export const faq = {
  list: () => api.get('/faq/'),
  create: (data) => api.post('/faq/', data),
  get: (id) => api.get(`/faq/${id}/`),
  update: (id, data) => api.put(`/faq/${id}/`, data),
  delete: (id) => api.delete(`/faq/${id}/`),
};

export const quickLinks = {
  list: () => api.get('/quick-links/'),
  create: (data) => api.post('/quick-links/', data),
  get: (id) => api.get(`/quick-links/${id}/`),
  update: (id, data) => api.put(`/quick-links/${id}/`, data),
  delete: (id) => api.delete(`/quick-links/${id}/`),
};

// ─────────────────────────────────────────────
// CLUBS & EVENTS
// ─────────────────────────────────────────────

export const clubs = {
  /** GET /api/clubs/?category=&active= */
  list: (params) => api.get('/clubs/', { params: clean(params) }),
  create: (data) => api.post('/clubs/', data),
  get: (id) => api.get(`/clubs/${id}/`),
  update: (id, data) => api.put(`/clubs/${id}/`, data),
  delete: (id) => api.delete(`/clubs/${id}/`),

  // Memberships
  /** GET /api/club-memberships/?club=&user= */
  membershipList: (params) =>
    api.get('/club-memberships/', { params: clean(params) }),
  membershipCreate: (data) => api.post('/club-memberships/', data),
  membershipGet: (id) => api.get(`/club-memberships/${id}/`),
  membershipUpdate: (id, data) =>
    api.put(`/club-memberships/${id}/`, data),
  membershipDelete: (id) => api.delete(`/club-memberships/${id}/`),

  // Club Events
  /** GET /api/club-events/?club=&status= */
  eventList: (params) =>
    api.get('/club-events/', { params: clean(params) }),
  eventCreate: (data) => api.post('/club-events/', data),
  eventGet: (id) => api.get(`/club-events/${id}/`),
  eventUpdate: (id, data) => api.put(`/club-events/${id}/`, data),
  eventDelete: (id) => api.delete(`/club-events/${id}/`),
};

export const events = {
  /** GET /api/events/?event_type=&upcoming= */
  list: (params) => api.get('/events/', { params: clean(params) }),
  create: (data) => api.post('/events/', data),
  get: (id) => api.get(`/events/${id}/`),
  update: (id, data) => api.put(`/events/${id}/`, data),
  delete: (id) => api.delete(`/events/${id}/`),

  // Registrations
  /** GET /api/event-registrations/?event= */
  registrationList: (params) =>
    api.get('/event-registrations/', { params: clean(params) }),
  register: (data) => api.post('/event-registrations/', data),
  registrationGet: (id) => api.get(`/event-registrations/${id}/`),
  unregister: (id) => api.delete(`/event-registrations/${id}/`),
};

// ─────────────────────────────────────────────
// ANALYTICS  —  /api/analytics/
// ─────────────────────────────────────────────

export const analytics = {
  /** GET /api/analytics/dashboard/ */
  dashboard: () => api.get('/analytics/dashboard/'),

  /** GET /api/analytics/metrics/ */
  metrics: () => api.get('/analytics/metrics/'),

  /** GET /api/analytics/activity-log/?user=&action=&from_date=&to_date= */
  activityLog: (params) =>
    api.get('/analytics/activity-log/', { params: clean(params) }),

  /** GET /api/analytics/page-visits/?url= */
  pageVisits: (params) =>
    api.get('/analytics/page-visits/', { params: clean(params) }),
};

// ─────────────────────────────────────────────
// SECURITY  —  /api/security/
// ─────────────────────────────────────────────

export const security = {
  /** GET /api/security/login-attempts/?username=&success= */
  loginAttempts: (params) =>
    api.get('/security/login-attempts/', { params: clean(params) }),

  /** GET /api/security/alerts/?resolved= */
  alertList: (params) =>
    api.get('/security/alerts/', { params: clean(params) }),
  alertGet: (id) => api.get(`/security/alerts/${id}/`),
  alertUpdate: (id, data) => api.put(`/security/alerts/${id}/`, data),
};

// ─────────────────────────────────────────────
// REPORTS  —  /api/reports/
// ─────────────────────────────────────────────

export const reports = {
  /** GET /api/reports/enrollment/?programme=&semester= */
  enrollment: (params) =>
    api.get('/reports/enrollment/', { params: clean(params) }),

  /** GET /api/reports/performance/?programme=&semester= */
  performance: (params) =>
    api.get('/reports/performance/', { params: clean(params) }),

  /** GET /api/reports/workload/?department=&semester= */
  workload: (params) =>
    api.get('/reports/workload/', { params: clean(params) }),

  /** GET /api/reports/finance/?academic_year= */
  finance: (params) =>
    api.get('/reports/finance/', { params: clean(params) }),
};
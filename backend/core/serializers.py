from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import (
    User, Faculty, Department, Programme, Course, ProgrammeCourse,
    Lecturer, Student, Staff, AcademicYear, Semester, StudentReporting,
    Enrollment, Grade, LecturerCourseAssignment, CourseNotes, Assignment,
    AssignmentSubmission, NotesDownload, AssignmentAnnouncement, ExamRepository,
    SpecialExamApplication, DefermentApplication, ClearanceRequest, Message,
    MessageThread, ExamMaterialDownload, StudentNotification, FeeStructure,
    FeePayment, Research, Library, LibraryTransaction, Hostel, Room, Bed,
    HostelBooking, HostelPayment, HostelIncident, Examination, Timetable,
    AttendanceSession, Attendance, Notification, NewsArticle, StudentComment,
    CommonQuestion, QuickLink, StudentClub, ClubMembership, ClubEvent, Event,
    EventRegistration, UserSession, ActivityLog, PageVisit, SystemMetrics,
    AdminLoginAttempt, AdminTwoFactorCode, AdminSecurityAlert,
)


# ─────────────────────────────────────────────
# AUTH / USER
# ─────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match.")
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'user_type', 'phone', 'address', 'gender', 'date_of_birth',
            'profile_picture', 'national_id', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email',
            'user_type', 'phone', 'address', 'gender', 'date_of_birth',
            'profile_picture', 'national_id',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'user_type']

    def get_full_name(self, obj):
        return obj.get_full_name()


# ─────────────────────────────────────────────
# ACADEMIC STRUCTURE
# ─────────────────────────────────────────────

class FacultySerializer(serializers.ModelSerializer):
    dean_name = serializers.SerializerMethodField()

    class Meta:
        model = Faculty
        fields = '__all__'

    def get_dean_name(self, obj):
        return obj.dean.get_full_name() if obj.dean else None


class DepartmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    hod_name = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_hod_name(self, obj):
        return obj.head_of_department.get_full_name() if obj.head_of_department else None


class DepartmentMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code']


class ProgrammeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model = Programme
        fields = '__all__'


class ProgrammeMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ['id', 'name', 'code', 'programme_type']


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    total_contact_hours = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_total_contact_hours(self, obj):
        return obj.total_contact_hours()


class CourseMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'credit_hours', 'level']


class ProgrammeCourseSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)

    class Meta:
        model = ProgrammeCourse
        fields = '__all__'


# ─────────────────────────────────────────────
# PEOPLE
# ─────────────────────────────────────────────

class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Lecturer
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class LecturerMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Lecturer
        fields = ['id', 'employee_number', 'full_name', 'academic_rank']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class StudentMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'student_id', 'full_name', 'programme', 'current_year', 'current_semester', 'status']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Staff
        fields = '__all__'


# ─────────────────────────────────────────────
# ACADEMIC YEAR / SEMESTER
# ─────────────────────────────────────────────

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'


class SemesterSerializer(serializers.ModelSerializer):
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = Semester
        fields = '__all__'


# ─────────────────────────────────────────────
# STUDENT REPORTING
# ─────────────────────────────────────────────

class StudentReportingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentReporting
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None


# ─────────────────────────────────────────────
# ENROLLMENT
# ─────────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    lecturer_name = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_lecturer_name(self, obj):
        return obj.lecturer.user.get_full_name() if obj.lecturer else None


# ─────────────────────────────────────────────
# GRADES
# ─────────────────────────────────────────────

class GradeSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='enrollment.student.student_id', read_only=True)
    student_name = serializers.SerializerMethodField()
    course_code = serializers.CharField(source='enrollment.course.code', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)

    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['total_marks', 'grade', 'grade_points', 'quality_points', 'is_passed']

    def get_student_name(self, obj):
        return obj.enrollment.student.user.get_full_name()


class GradeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = [
            'enrollment', 'continuous_assessment', 'final_exam',
            'practical_marks', 'project_marks', 'exam_date', 'remarks',
        ]


# ─────────────────────────────────────────────
# LECTURER COURSE ASSIGNMENT
# ─────────────────────────────────────────────

class LecturerCourseAssignmentSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LecturerCourseAssignment
        fields = '__all__'

    def get_lecturer_name(self, obj):
        return obj.lecturer.user.get_full_name()

    def get_assigned_by_name(self, obj):
        return obj.assigned_by.get_full_name() if obj.assigned_by else None


# ─────────────────────────────────────────────
# COURSE NOTES
# ─────────────────────────────────────────────

class CourseNotesSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(
        source='lecturer_assignment.course.code', read_only=True
    )
    course_name = serializers.CharField(
        source='lecturer_assignment.course.name', read_only=True
    )
    lecturer_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseNotes
        fields = '__all__'
        read_only_fields = ['download_count', 'posted_date', 'updated_date']

    def get_lecturer_name(self, obj):
        return obj.lecturer_assignment.lecturer.user.get_full_name()


class NotesDownloadSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    notes_title = serializers.CharField(source='course_notes.title', read_only=True)

    class Meta:
        model = NotesDownload
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()


# ─────────────────────────────────────────────
# ASSIGNMENTS
# ─────────────────────────────────────────────

class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(
        source='lecturer_assignment.course.code', read_only=True
    )
    course_name = serializers.CharField(
        source='lecturer_assignment.course.name', read_only=True
    )
    lecturer_name = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    total_submissions = serializers.IntegerField(read_only=True)
    submitted_count = serializers.IntegerField(read_only=True)
    pending_submissions = serializers.IntegerField(read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ['posted_date']

    def get_lecturer_name(self, obj):
        return obj.lecturer_assignment.lecturer.user.get_full_name()


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    graded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = [
            'submitted_date', 'last_modified_date', 'is_late',
            'percentage_score', 'submission_status',
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_graded_by_name(self, obj):
        return obj.graded_by.get_full_name() if obj.graded_by else None


class AssignmentAnnouncementSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = AssignmentAnnouncement
        fields = '__all__'


# ─────────────────────────────────────────────
# EXAM REPOSITORY
# ─────────────────────────────────────────────

class ExamRepositorySerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamRepository
        fields = '__all__'
        read_only_fields = ['download_count', 'uploaded_date']

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.get_full_name() if obj.uploaded_by else None


class ExamMaterialDownloadSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    material_title = serializers.CharField(source='exam_material.title', read_only=True)

    class Meta:
        model = ExamMaterialDownload
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()


# ─────────────────────────────────────────────
# APPLICATIONS
# ─────────────────────────────────────────────

class SpecialExamApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SpecialExamApplication
        fields = '__all__'
        read_only_fields = ['application_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None


class DefermentApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DefermentApplication
        fields = '__all__'
        read_only_fields = ['application_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None


class ClearanceRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ClearanceRequest
        fields = '__all__'
        read_only_fields = ['request_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None


# ─────────────────────────────────────────────
# MESSAGING
# ─────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sent_date', 'is_read', 'read_date']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name()

    def get_replies_count(self, obj):
        return obj.replies.count()


class MessageThreadSerializer(serializers.ModelSerializer):
    participants_info = UserMinimalSerializer(source='participants', many=True, read_only=True)
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = '__all__'

    def get_latest_message(self, obj):
        msg = Message.objects.filter(
            sender__in=obj.participants.all()
        ).order_by('-sent_date').first()
        if msg:
            return {'subject': msg.subject, 'sent_date': msg.sent_date}
        return None


# ─────────────────────────────────────────────
# STUDENT NOTIFICATIONS
# ─────────────────────────────────────────────

class StudentNotificationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentNotification
        fields = '__all__'
        read_only_fields = ['created_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()


# ─────────────────────────────────────────────
# FEES
# ─────────────────────────────────────────────

class FeeStructureSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    programme_code = serializers.CharField(source='programme.code', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)
    total_fee = serializers.SerializerMethodField()
    net_fee = serializers.SerializerMethodField()

    class Meta:
        model = FeeStructure
        fields = '__all__'

    def get_total_fee(self, obj):
        return obj.total_fee()

    def get_net_fee(self, obj):
        return obj.net_fee()


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    programme_name = serializers.CharField(
        source='fee_structure.programme.name', read_only=True
    )
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FeePayment
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None


class StudentBalanceSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    student_name = serializers.CharField()
    total_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)


# ─────────────────────────────────────────────
# RESEARCH
# ─────────────────────────────────────────────

class ResearchSerializer(serializers.ModelSerializer):
    principal_investigator_name = serializers.SerializerMethodField()
    co_investigators_info = LecturerMinimalSerializer(
        source='co_investigators', many=True, read_only=True
    )
    students_info = StudentMinimalSerializer(source='students', many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Research
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_principal_investigator_name(self, obj):
        return obj.principal_investigator.user.get_full_name()


# ─────────────────────────────────────────────
# LIBRARY
# ─────────────────────────────────────────────

class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = '__all__'
        read_only_fields = ['added_date']


class LibraryTransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    resource_title = serializers.CharField(source='library_resource.title', read_only=True)
    librarian_name = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = LibraryTransaction
        fields = '__all__'
        read_only_fields = ['transaction_date']

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_librarian_name(self, obj):
        return obj.librarian.get_full_name() if obj.librarian else None

    def get_is_overdue(self, obj):
        if obj.status == 'active' and obj.due_date:
            return timezone.now().date() > obj.due_date
        return False


# ─────────────────────────────────────────────
# HOSTEL
# ─────────────────────────────────────────────

class HostelSerializer(serializers.ModelSerializer):
    warden_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='school.name', read_only=True)
    total_beds = serializers.SerializerMethodField()
    available_beds = serializers.SerializerMethodField()

    class Meta:
        model = Hostel
        fields = '__all__'

    def get_warden_name(self, obj):
        return obj.warden.get_full_name() if obj.warden else None

    def _get_current_year(self):
        return AcademicYear.objects.filter(is_current=True).first()

    def get_total_beds(self, obj):
        year = self._get_current_year()
        return obj.get_total_beds_count(year) if year else 0

    def get_available_beds(self, obj):
        year = self._get_current_year()
        return 0 if not year else (
            obj.get_total_beds_count(year) - obj.get_occupied_beds_count(year)
        )


class RoomSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    available_beds = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_available_beds(self, obj):
        year = AcademicYear.objects.filter(is_current=True).first()
        return obj.get_available_beds_count(year) if year else 0


class BedSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    hostel_name = serializers.CharField(source='room.hostel.name', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = Bed
        fields = '__all__'
        read_only_fields = ['bed_number', 'created_at']


class HostelBookingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    bed_number = serializers.CharField(source='bed.bed_number', read_only=True)
    room_number = serializers.CharField(source='bed.room.room_number', read_only=True)
    hostel_name = serializers.CharField(source='bed.room.hostel.name', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_fully_paid = serializers.BooleanField(read_only=True)

    class Meta:
        model = HostelBooking
        fields = '__all__'
        read_only_fields = ['booking_date', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name() if obj.approved_by else None


class HostelPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    received_by_name = serializers.SerializerMethodField()

    class Meta:
        model = HostelPayment
        fields = '__all__'
        read_only_fields = ['receipt_number', 'created_at']

    def get_student_name(self, obj):
        return obj.booking.student.user.get_full_name()

    def get_received_by_name(self, obj):
        return obj.received_by.get_full_name() if obj.received_by else None


class HostelIncidentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    reported_by_name = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = HostelIncident
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.booking.student.user.get_full_name()

    def get_reported_by_name(self, obj):
        return obj.reported_by.get_full_name() if obj.reported_by else None

    def get_handled_by_name(self, obj):
        return obj.handled_by.get_full_name() if obj.handled_by else None


# ─────────────────────────────────────────────
# EXAMINATIONS
# ─────────────────────────────────────────────

class ExaminationSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    invigilators_info = LecturerMinimalSerializer(source='invigilators', many=True, read_only=True)
    end_time = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Examination
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_end_time(self, obj):
        return obj.end_time()

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name()


# ─────────────────────────────────────────────
# TIMETABLE
# ─────────────────────────────────────────────

class TimetableSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    lecturer_name = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    programme_name = serializers.CharField(source='programme.name', read_only=True)

    class Meta:
        model = Timetable
        fields = '__all__'

    def get_lecturer_name(self, obj):
        return obj.lecturer.user.get_full_name()


# ─────────────────────────────────────────────
# ATTENDANCE
# ─────────────────────────────────────────────

class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(
        source='timetable_slot.course.code', read_only=True
    )
    course_name = serializers.CharField(
        source='timetable_slot.course.name', read_only=True
    )
    lecturer_name = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    qr_code_image_url = serializers.CharField(read_only=True)
    attendance_count = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession
        fields = '__all__'
        read_only_fields = ['session_token', 'created_at', 'qr_code_data']

    def get_lecturer_name(self, obj):
        return obj.lecturer.user.get_full_name()

    def get_attendance_count(self, obj):
        return obj.attendance_records.filter(status='present').count()


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_code = serializers.CharField(source='timetable_slot.course.code', read_only=True)
    course_name = serializers.CharField(source='timetable_slot.course.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['marked_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()


class AttendanceSummarySerializer(serializers.Serializer):
    course_code = serializers.CharField()
    course_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    attended = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    excused = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()


# ─────────────────────────────────────────────
# NOTIFICATIONS (SYSTEM-WIDE)
# ─────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    recipients_count = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

    def get_recipients_count(self, obj):
        return obj.recipients.count()


# ─────────────────────────────────────────────
# NEWS
# ─────────────────────────────────────────────

class NewsArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = NewsArticle
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else None


# ─────────────────────────────────────────────
# STUDENT COMMENT
# ─────────────────────────────────────────────

class StudentCommentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentComment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_responded_by_name(self, obj):
        return obj.responded_by.get_full_name() if obj.responded_by else None


# ─────────────────────────────────────────────
# COMMON Q&A / QUICK LINKS
# ─────────────────────────────────────────────

class CommonQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonQuestion
        fields = '__all__'


class QuickLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickLink
        fields = '__all__'


# ─────────────────────────────────────────────
# CLUBS & EVENTS
# ─────────────────────────────────────────────

class StudentClubSerializer(serializers.ModelSerializer):
    chairperson_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = StudentClub
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_chairperson_name(self, obj):
        return obj.chairperson.get_full_name() if obj.chairperson else None

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class ClubMembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = ClubMembership
        fields = '__all__'
        read_only_fields = ['date_joined']

    def get_student_name(self, obj):
        return obj.student.get_full_name()


class ClubEventSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True)
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = ClubEvent
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status']

    def get_organizer_name(self, obj):
        return obj.organizer.get_full_name() if obj.organizer else None


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    registration_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_organizer_name(self, obj):
        return obj.organizer.get_full_name()

    def get_registration_count(self, obj):
        return obj.registrations.count()


class EventRegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = ['registration_date']

    def get_user_name(self, obj):
        return obj.user.get_full_name()


# ─────────────────────────────────────────────
# ANALYTICS / SESSIONS / ACTIVITY
# ─────────────────────────────────────────────

class UserSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = '__all__'

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_duration(self, obj):
        return str(obj.duration)


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['timestamp']

    def get_user_name(self, obj):
        return obj.user.get_full_name()


class PageVisitSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = PageVisit
        fields = '__all__'
        read_only_fields = ['timestamp']

    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'Anonymous'


class SystemMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemMetrics
        fields = '__all__'


class DashboardAnalyticsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    total_lecturers = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_programmes = serializers.IntegerField()
    total_departments = serializers.IntegerField()
    current_semester = serializers.CharField()
    current_academic_year = serializers.CharField()
    total_payments_this_semester = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_applications = serializers.IntegerField()
    hostel_occupancy_rate = serializers.FloatField()
    overdue_library_books = serializers.IntegerField()


# ─────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────

class AdminLoginAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminLoginAttempt
        fields = '__all__'
        read_only_fields = ['attempt_time']


class AdminTwoFactorCodeSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = AdminTwoFactorCode
        fields = ['id', 'user', 'code', 'created_at', 'expires_at', 'is_used', 'is_expired', 'is_valid']
        read_only_fields = ['created_at', 'expires_at']


class AdminSecurityAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminSecurityAlert
        fields = '__all__'
        read_only_fields = ['created_at']


# ─────────────────────────────────────────────
# TRANSCRIPT
# ─────────────────────────────────────────────

class TranscriptCourseSerializer(serializers.Serializer):
    course_code = serializers.CharField()
    course_name = serializers.CharField()
    credit_hours = serializers.IntegerField()
    grade = serializers.CharField()
    grade_points = serializers.FloatField()
    quality_points = serializers.FloatField()
    semester = serializers.CharField()
    academic_year = serializers.CharField()
    is_passed = serializers.BooleanField()


class TranscriptSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    student_name = serializers.CharField()
    programme = serializers.CharField()
    admission_date = serializers.DateField()
    current_year = serializers.IntegerField()
    cumulative_gpa = serializers.FloatField(allow_null=True)
    total_credit_hours = serializers.IntegerField()
    courses = TranscriptCourseSerializer(many=True)
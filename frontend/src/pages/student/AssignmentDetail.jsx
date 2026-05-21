/**
 * pages/student/AssignmentDetail.jsx
 * View a single assignment and submit a file.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignments, students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { flash } = useFlash();
  const fileRef = useRef();

  const [assignment,  setAssignment]  = useState(null);
  const [submission,  setSubmission]  = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [notes,       setNotes]       = useState('');
  const [file,        setFile]        = useState(null);
  const [profile,     setProfile]     = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, aRes, annRes] = await Promise.all([
          students.myProfile(),
          assignments.get(id),
          assignments.announcementList({ assignment: id }),
        ]);
        setProfile(profileRes.data);
        setAssignment(aRes.data);
        setAnnouncements(annRes.data.results ?? annRes.data);

        // Check for existing submission
        const subRes = await assignments.submissionList({ assignment: id, student: profileRes.data.id });
        const subs = subRes.data.results ?? subRes.data;
        if (subs.length > 0) setSubmission(subs[0]);
      } catch {
        flash('Could not load assignment.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { flash('Please select a file to submit.', 'warning'); return; }
    setSubmitting(true);
    try {
      await assignments.submissionCreate({
        assignment: id,
        student: profile.id,
        submission_file: file,
        notes,
      });
      flash('Assignment submitted successfully.', 'success');
      // Reload submission
      const subRes = await assignments.submissionList({ assignment: id, student: profile.id });
      setSubmission((subRes.data.results ?? subRes.data)[0] || null);
      setFile(null);
      setNotes('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      flash(err.response?.data?.detail || 'Submission failed.', 'danger');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading…</div></div>;
  if (!assignment) return <div className="page-wrapper"><div className="empty-state"><i className="ri-file-search-line" /><p>Assignment not found.</p></div></div>;

  const due = new Date(assignment.due_date);
  const isOverdue = due < new Date();
  const canSubmit = !isOverdue && !submission;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item"><Link to="/student/assignments">Assignments</Link></li>
          <li className="breadcrumb-item active">{assignment.title}</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">{assignment.title}</h1>
          <p className="page-header__sub">{assignment.course_name} · {assignment.course_code}</p>
        </div>
        <div className="page-header__actions">
          {assignment.assignment_file && (
            <a href={assignment.assignment_file} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              <i className="ri-download-line" /> Download Brief
            </a>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          {/* Details card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h5>Assignment Details</h5></div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  ['Lecturer', assignment.lecturer_name],
                  ['Total Marks', assignment.total_marks],
                  ['Due Date', due.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Posted Date', assignment.posted_date ? new Date(assignment.posted_date).toLocaleDateString('en-KE') : '—'],
                  ['Status', isOverdue ? 'Overdue' : 'Open'],
                ].map(([label, value]) => (
                  <div className="col-md-6" key={label}>
                    <div className="info-row">
                      <span className="info-row__label">{label}</span>
                      <span className="info-row__value"
                        style={label === 'Status' ? { color: isOverdue ? 'var(--danger)' : 'var(--success)', fontWeight: 600 } : {}}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {assignment.instructions && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Instructions</div>
                  <div style={{ lineHeight: 1.7, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{assignment.instructions}</div>
                </div>
              )}
            </div>
          </div>

          {/* Submission form / result */}
          <div className="card">
            <div className="card-header">
              <h5>{submission ? 'Your Submission' : 'Submit Assignment'}</h5>
            </div>
            <div className="card-body">
              {submission ? (
                <>
                  <div style={{
                    padding: '12px 16px', borderRadius: 'var(--radius)',
                    background: submission.grading_status === 'graded' ? '#d4edda' : '#cce5ff',
                    border: `1px solid ${submission.grading_status === 'graded' ? '#28a745' : '#0d6efd'}`,
                    marginBottom: 16,
                  }}>
                    <strong>
                      {submission.grading_status === 'graded' ? '✔ Graded' : '⏳ Submitted — awaiting grading'}
                    </strong>
                  </div>
                  {[
                    ['Submitted',     new Date(submission.submitted_date).toLocaleDateString('en-KE')],
                    ['Late?',         submission.is_late ? 'Yes' : 'No'],
                    ['Marks Obtained', submission.marks_obtained ?? '—'],
                    ['Score',          submission.percentage_score != null ? `${submission.percentage_score}%` : '—'],
                  ].map(([label, value]) => (
                    <div className="info-row" key={label}>
                      <span className="info-row__label">{label}</span>
                      <span className="info-row__value">{value}</span>
                    </div>
                  ))}
                  {submission.lecturer_feedback && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Feedback</div>
                      <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 'var(--radius)', lineHeight: 1.6 }}>
                        {submission.lecturer_feedback}
                      </div>
                    </div>
                  )}
                  {submission.submission_file && (
                    <a href={submission.submission_file} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary" style={{ marginTop: 12 }}>
                      <i className="ri-download-line" /> My Submitted File
                    </a>
                  )}
                </>
              ) : isOverdue ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <i className="ri-alarm-warning-line" style={{ color: 'var(--danger)' }} />
                  <p>This assignment is overdue. Submissions are closed.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Submission File <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input ref={fileRef} type="file" className="form-control"
                        onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.zip" />
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Accepted: PDF, DOC, DOCX, ZIP</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes (optional)</label>
                      <textarea className="form-control" rows={3} value={notes}
                        onChange={e => setNotes(e.target.value)} placeholder="Any notes for your lecturer…" />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : <><i className="ri-upload-2-line" /> Submit Assignment</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right: announcements */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header"><h5><i className="ri-megaphone-line" style={{ marginRight: 6 }} />Announcements</h5></div>
            <div className="card-body" style={{ padding: 0 }}>
              {announcements.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <i className="ri-chat-off-line" />
                  <p style={{ fontSize: 13 }}>No announcements.</p>
                </div>
              ) : (
                announcements.map(a => (
                  <div key={a.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-KE') : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
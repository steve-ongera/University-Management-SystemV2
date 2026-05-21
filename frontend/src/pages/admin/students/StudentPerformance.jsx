import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { students } from '../../../api/api';
import { useFlash } from '../../../components/FlashMessages';

export default function StudentPerformance() {
  const { id } = useParams();
  const { flash } = useFlash();
  const [student, setStudent] = useState(null);
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, gRes] = await Promise.all([students.get(id), students.grades(id)]);
        setStudent(sRes.data);
        setGrades(gRes.data.results ?? gRes.data);
      } catch {
        flash('Failed to load performance data.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="loading-block" style={{ height: '60vh' }}><span className="spinner" /> Loading…</div>;

  const name = student?.full_name || `${student?.user?.first_name} ${student?.user?.last_name}`;

  // group by semester
  const bySemester = grades.reduce((acc, g) => {
    const key = g.semester || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});

  const totalCH = grades.reduce((s, g) => s + (g.credit_hours || 0), 0);
  const totalQP = grades.reduce((s, g) => s + (g.quality_points || 0), 0);
  const cgpa    = totalCH ? (totalQP / totalCH).toFixed(2) : '—';

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/students">Students</Link></li>
          <li className="breadcrumb-item"><Link to={`/admin/students/${id}`}>{name}</Link></li>
          <li className="breadcrumb-item active">Performance</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">Performance — {name}</h1>
          <p className="page-header__sub">{student?.student_id} &mdash; {student?.programme_name}</p>
        </div>
        <div className="page-header__actions">
          <Link to={`/admin/students/${id}`} className="btn btn-secondary btn-sm">
            <i className="ri-arrow-left-line" /> Back
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary"><i className="ri-bar-chart-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{cgpa}</div>
            <div className="stat-card__label">Cumulative GPA</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><i className="ri-book-open-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{grades.length}</div>
            <div className="stat-card__label">Courses Taken</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info"><i className="ri-checkbox-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{grades.filter(g => g.is_passed).length}</div>
            <div className="stat-card__label">Courses Passed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--danger"><i className="ri-close-circle-line" /></div>
          <div className="stat-card__body">
            <div className="stat-card__value">{grades.filter(g => !g.is_passed).length}</div>
            <div className="stat-card__label">Failed / Retake</div>
          </div>
        </div>
      </div>

      {Object.entries(bySemester).map(([sem, semGrades]) => (
        <div key={sem} className="card">
          <div className="card-header">
            <h5><i className="ri-calendar-line" /> {sem}</h5>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              GPA: {semGrades[0]?.grade_points ?? '—'}
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credit Hours</th>
                    <th>CA</th>
                    <th>Exam</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Quality Points</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {semGrades.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.course_code}</td>
                      <td>{g.course_name}</td>
                      <td>{g.credit_hours ?? '—'}</td>
                      <td>{g.continuous_assessment ?? '—'}</td>
                      <td>{g.final_exam ?? '—'}</td>
                      <td><strong>{g.total_marks ?? '—'}</strong></td>
                      <td><span className="badge badge-primary">{g.grade ?? '—'}</span></td>
                      <td>{g.quality_points ?? '—'}</td>
                      <td>
                        <span className={`badge ${g.is_passed ? 'badge-success' : 'badge-danger'}`}>
                          {g.is_passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {grades.length === 0 && (
        <div className="empty-state" style={{ padding: 60 }}>
          <i className="ri-bar-chart-line" />
          <p>No academic records found for this student.</p>
        </div>
      )}
    </div>
  );
}
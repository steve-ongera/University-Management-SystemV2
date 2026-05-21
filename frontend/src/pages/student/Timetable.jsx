/**
 * pages/student/Timetable.jsx
 * Weekly timetable grid for the student's current semester/programme.
 */

import { useState, useEffect } from 'react';
import { timetable, students } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS   = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const COLORS  = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function StudentTimetable() {
  const { flash } = useFlash();
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await students.myProfile();
        setProfile(profileRes.data);
        const res = await timetable.list({ programme: profileRes.data.programme, year: profileRes.data.current_year });
        setSlots(res.data.results ?? res.data);
      } catch {
        flash('Could not load timetable.', 'danger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Assign a color per course
  const courseColorMap = {};
  let colorIdx = 0;
  slots.forEach(s => {
    if (!courseColorMap[s.course_code]) {
      courseColorMap[s.course_code] = COLORS[colorIdx++ % COLORS.length];
    }
  });

  // Find slot for a given day and hour
  function getSlot(day, hour) {
    return slots.find(s => {
      if (s.day_of_week?.toLowerCase() !== day.toLowerCase()) return false;
      const start = s.start_time?.slice(0, 5);
      const end   = s.end_time?.slice(0, 5);
      return start === hour || (start < hour && end > hour);
    });
  }

  if (loading) return <div className="page-wrapper"><div className="loading-block"><span className="spinner" />Loading timetable…</div></div>;

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/student/dashboard">Dashboard</a></li>
          <li className="breadcrumb-item active">Timetable</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">My Timetable</h1>
          <p className="page-header__sub">{profile?.programme_name} — Year {profile?.current_year}, Semester {profile?.current_semester}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <i className="ri-printer-line" /> Print
          </button>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="card"><div className="empty-state"><i className="ri-calendar-2-line" /><p>No timetable has been published for your programme yet.</p></div></div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 70 }} />
                {DAYS.map(d => <col key={d} />)}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '10px 8px', background: 'var(--bg-subtle)', fontSize: 12, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>Time</th>
                  {DAYS.map(d => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    return (
                      <th key={d} style={{
                        padding: '10px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600,
                        background: today === d ? 'var(--primary-light)' : 'var(--bg-subtle)',
                        color: today === d ? 'var(--primary)' : 'var(--text)',
                        borderBottom: '2px solid var(--border)',
                        borderLeft: '1px solid var(--border)',
                      }}>{d}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontSize: 12, color: 'var(--text-muted)', verticalAlign: 'middle', background: 'var(--bg-subtle)', fontFamily: 'monospace' }}>
                      {hour}
                    </td>
                    {DAYS.map(day => {
                      const slot = getSlot(day, hour);
                      const isStart = slot?.start_time?.slice(0, 5) === hour;
                      if (slot && !isStart) return null; // continuation — skip
                      const color = slot ? courseColorMap[slot.course_code] : null;
                      return (
                        <td key={day} style={{
                          borderLeft: '1px solid var(--border)',
                          padding: slot ? 4 : 0,
                          verticalAlign: 'top',
                          height: 52,
                        }}>
                          {slot && isStart && (
                            <div style={{
                              background: `${color}18`,
                              border: `2px solid ${color}`,
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 8px',
                              height: '100%',
                              minHeight: 44,
                            }}>
                              <div style={{ fontWeight: 600, fontSize: 12, color }}>{slot.course_code}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {slot.course_name}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                {slot.venue} · {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      {slots.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(courseColorMap).map(([code, color]) => {
            const s = slots.find(x => x.course_code === code);
            return (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block' }} />
                <span>{code} — {s?.course_name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
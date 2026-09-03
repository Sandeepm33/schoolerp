'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  Loader2,
  Filter,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useDataSync } from '../context/DataSyncContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL || 'http://127.0.0.1:5000/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_CONFIG = {
  P: { label: 'Present', short: 'P', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  A: { label: 'Absent', short: 'A', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30' },
  L: { label: 'Late', short: 'L', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  HD: { label: 'Half Day', short: 'HD', bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  LV: { label: 'Leave', short: 'LV', bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/30' },
  NM: { label: 'Not Marked', short: 'NM', bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-700' }
};

// normalize "Class LKG" -> "LKG", "LKG" -> "LKG"
const normClass = (v) => String(v || '').replace(/^Class\s+/i, '').trim();
// normalize "Section A" -> "A", "A" -> "A"
const normSection = (v) => String(v || '').replace(/^Section\s+/i, '').trim();

export default function StudentAttendanceReport({
  defaultClass = '',
  defaultSection = '',
  lockedStudentId = '',    // If set: skip selectors, only show THIS student
  lockedStudentName = '',  // Display name when locked
}) {
  const { token: authToken } = useAuth();
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableSections, setAvailableSections] = useState(['A', 'B', 'C', 'D']);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(lockedStudentId || '');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  const [viewMode, setViewMode] = useState('monthly');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Store token in a ref so effects can read it without it being a dependency
  const tokenRef = useRef('');
  useEffect(() => {
    const t = authToken ||
      (typeof window !== 'undefined'
        ? (localStorage.getItem('erp_token') || localStorage.getItem('token') || '')
        : '');
    tokenRef.current = t;
    // Trigger class list load once token is ready
    if (t && (lockedStudentId || classList.length === 0)) {
      setForceLoad(prev => prev + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // Trigger to re-run effects after token is available
  const [forceLoad, setForceLoad] = useState(0);

  // ── 1. Load class list (only when NOT locked to a specific student) ──────
  useEffect(() => {
    if (lockedStudentId) return; // Skip: locked to a specific student
    const token = tokenRef.current;
    if (!token) return;
    fetch(`${API_BASE}/admin/classes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setClassList(list);

        const defNorm = normClass(defaultClass);
        const match = defNorm
          ? list.find(c => normClass(c.className || c.name) === defNorm)
          : null;

        const picked = match || list[0];
        if (picked) {
          const pickedName = normClass(picked.className || picked.name);
          setSelectedClass(pickedName);

          const secs = Array.isArray(picked.sections) && picked.sections.length > 0
            ? picked.sections.map(s => normSection(s))
            : ['A', 'B', 'C', 'D'];
          setAvailableSections(secs);

          const defSecNorm = normSection(defaultSection);
          const matchSec = defSecNorm && secs.includes(defSecNorm) ? defSecNorm : secs[0];
          setSelectedSection(matchSec);
        } else {
          setSelectedClass(normClass(defaultClass) || 'LKG');
          setSelectedSection(normSection(defaultSection) || 'A');
        }
      })
      .catch(() => {
        setSelectedClass(normClass(defaultClass) || 'LKG');
        setSelectedSection(normSection(defaultSection) || 'A');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceLoad]);

  // ── 2. Update sections when class changes ───────────────────────────────
  const handleClassChange = (newClass) => {
    const normC = normClass(newClass);
    setSelectedClass(normC);
    setSelectedStudentId('');
    setStudents([]);

    const cls = classList.find(c => normClass(c.className || c.name) === normC);
    if (cls && Array.isArray(cls.sections) && cls.sections.length > 0) {
      const secs = cls.sections.map(s => normSection(s));
      setAvailableSections(secs);
      setSelectedSection(secs[0]);
    } else {
      setAvailableSections(['A', 'B', 'C', 'D']);
      setSelectedSection('A');
    }
  };

  // ── 3. Fetch students (only when NOT locked) ───────────────────────────
  useEffect(() => {
    if (lockedStudentId) return; // Skip: we already know the student
    if (!selectedClass) return;
    const token = tokenRef.current;
    if (!token) return;

    setLoadingStudents(true);
    setFetchError('');

    const url = `${API_BASE}/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(prev =>
            (prev && list.some(s => String(s._id) === String(prev))) ? prev : String(list[0]._id)
          );
        } else {
          setSelectedStudentId('');
          setHistoryData(null);
        }
      })
      .catch(e => {
        setFetchError(e.message);
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSection, forceLoad]);

  // ── 4. Fetch student attendance history ─────────────────────────────────
  const loadStudentHistory = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const token = tokenRef.current;
      const res = await fetch(
        `${API_BASE}/attendance/student/${selectedStudentId}/history?academicYear=2026-2027`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId]);

  useEffect(() => {
    loadStudentHistory();
  }, [loadStudentHistory]);

  // Live sync
  useDataSync(React.useCallback(() => {
    loadStudentHistory();
  }, [loadStudentHistory]), ['ATTENDANCE']);

  const selectedStudent = students.find(s => String(s._id) === String(selectedStudentId)) || historyData?.student;

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    const totalDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr });
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth, currentYear);
  const calendarMap = historyData?.calendarMap || {};
  const summary = historyData?.summary || { totalWorkingDays: 0, totalPresent: 0, totalAbsent: 0, totalLate: 0, totalLeave: 0, attendancePercentage: 0 };
  const monthlyBreakdown = historyData?.monthlyBreakdown || [];

  return (
    <div className="space-y-6">
      {/* ─── TOP BAR: always visible — title + view mode switcher ─── */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              {lockedStudentId ? `${lockedStudentName || 'Student'}'s Attendance` : 'Student Attendance Viewer'}
            </h3>
            <p className="text-[10px] text-slate-400">Monthly Calendar · 12-Month Yearly · Full Timeline</p>
          </div>
        </div>

        {/* View Mode Switcher — always visible */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button onClick={() => setViewMode('monthly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'monthly' ? 'gradient-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <CalendarIcon className="w-3.5 h-3.5" /> Monthly
          </button>
          <button onClick={() => setViewMode('yearly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'yearly' ? 'gradient-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <BarChart3 className="w-3.5 h-3.5" /> 12-Month Yearly
          </button>
          <button onClick={() => setViewMode('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'timeline' ? 'gradient-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <FileText className="w-3.5 h-3.5" /> Full Timeline
          </button>
        </div>
      </div>

      {/* ─── CLASS / STUDENT SELECTORS — only shown when NOT locked (Teacher / Admin) ─── */}
      {!lockedStudentId && (
      <div className="glass-card px-5 pb-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pt-5 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Select Class & Student</h3>
            <p className="text-[10px] text-slate-500">Filter by class, section and student name</p>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Class Select */}
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={e => handleClassChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
            >
              {classList.length > 0
                ? classList.map(c => {
                    const n = normClass(c.className || c.name);
                    return <option key={c._id || n} value={n}>{n}</option>;
                  })
                : <option value={selectedClass}>{selectedClass || 'LKG'}</option>
              }
            </select>
          </div>

          {/* Section Select */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={e => { setSelectedSection(normSection(e.target.value)); setSelectedStudentId(''); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
            >
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Student Select */}
          <div className="sm:col-span-7">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Student ({loadingStudents ? '...' : students.length})
            </label>
            {fetchError && (
              <p className="text-[10px] text-rose-400 mb-1">⚠ API error: {fetchError}</p>
            )}
            {loadingStudents ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-xs text-rose-400 font-bold">
                No students found in Class {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-extrabold shadow-sm"
              >
                {students.map(st => (
                  <option key={st._id} value={st._id}>
                    {st.firstName} {st.lastName} (Roll: {st.rollNo || 'N/A'} • Adm: {st.admissionNo})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
      )} {/* end !lockedStudentId selector card */}

      {/* ─── SUMMARY CARDS ─── */}
      {selectedStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
              summary.attendancePercentage >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              summary.attendancePercentage >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {summary.attendancePercentage}%
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Overall Att. %</p>
              <p className="text-xs font-black text-white mt-0.5">
                {summary.attendancePercentage >= 75 ? 'Good Standing' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Present Days</p>
              <p className="text-base font-black text-white">{summary.totalPresent} <span className="text-xs text-slate-400 font-normal">/ {summary.totalWorkingDays}</span></p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-rose-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Absent Days</p>
              <p className="text-base font-black text-rose-400">{summary.totalAbsent} <span className="text-xs text-slate-400 font-normal">Days</span></p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Late / Leave</p>
              <p className="text-base font-black text-amber-300">{summary.totalLate + summary.totalLeave} <span className="text-xs text-slate-400 font-normal">Days</span></p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-2 border border-slate-800">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold">Loading student attendance history...</p>
        </div>
      )}

      {/* ─── MODE 1: MONTHLY INTERACTIVE CALENDAR ─── */}
      {!loading && viewMode === 'monthly' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => {
                if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
                else { setCurrentMonth(m => m - 1); }
              }} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h4 className="text-base font-black text-white min-w-[160px] text-center">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h4>
              <button onClick={() => {
                if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
                else { setCurrentMonth(m => m + 1); }
              }} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Present</span>
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded-md bg-rose-500 inline-block" /> Absent</span>
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> Late</span>
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded-md bg-sky-500 inline-block" /> Leave</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 rounded-md bg-slate-800 inline-block" /> Weekend/No Class</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[11px] font-black uppercase text-slate-500 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
                {d}
              </div>
            ))}

            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-20 bg-slate-950/30 rounded-2xl border border-slate-900 opacity-20" />;
              }

              const record = calendarMap[item.dateStr];
              const stCode = record ? record.status : 'NM';
              const cfg = STATUS_CONFIG[stCode] || STATUS_CONFIG.NM;
              const isWeekend = new Date(item.dateStr).getDay() === 0;

              return (
                <div key={item.dateStr}
                  className={`h-24 p-2.5 rounded-2xl border transition relative flex flex-col justify-between group ${
                    record ? `${cfg.border} bg-slate-900/90 hover:scale-[1.02]` :
                    isWeekend ? 'bg-slate-950/40 border-slate-900 opacity-60' :
                    'bg-slate-900/40 border-slate-800/80'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isWeekend ? 'text-rose-400/80' : 'text-white'}`}>{item.day}</span>
                    {record && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-white ${cfg.bg}`}>
                        {cfg.short}
                      </span>
                    )}
                  </div>

                  {record ? (
                    <div className="space-y-0.5">
                      <p className={`text-[10px] font-extrabold ${cfg.text}`}>{cfg.label}</p>
                      {record.subject && <p className="text-[9px] text-indigo-300 truncate">{record.subject}</p>}
                      {record.remarks && <p className="text-[9px] text-slate-400 truncate" title={record.remarks}>{record.remarks}</p>}
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-600 font-medium">{isWeekend ? 'Sunday' : 'No Record'}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── MODE 2: 12-MONTH YEARLY OVERVIEW ─── */}
      {!loading && viewMode === 'yearly' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-extrabold text-white">12-Month Yearly Attendance Breakdown</h4>
              <p className="text-xs text-slate-400">Monthly attendance percentages & working day summary</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-xs border border-indigo-500/30">
              Academic Year 2026-2027
            </span>
          </div>

          {monthlyBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              No yearly attendance breakdown data available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {monthlyBreakdown.map((m) => {
                const monthName = MONTH_NAMES[(m.monthNo || 1) - 1] || m.month;
                return (
                  <div key={m.month} className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-white text-xs">{monthName}</h5>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                        m.percentage >= 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        m.percentage >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {m.percentage}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className={`h-full rounded-full ${m.percentage >= 75 ? 'bg-emerald-500' : m.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${m.percentage}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-emerald-500/10 p-1.5 rounded-xl border border-emerald-500/20 text-emerald-300 font-bold">
                        {m.present} Present
                      </div>
                      <div className="bg-rose-500/10 p-1.5 rounded-xl border border-rose-500/20 text-rose-300 font-bold">
                        {m.absent} Absent
                      </div>
                      <div className="bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20 text-amber-300 font-bold">
                        {m.late + m.leave} Late/Lv
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODE 3: DETAILED TIMELINE ─── */}
      {!loading && viewMode === 'timeline' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h4 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">Detailed Date-by-Date Attendance Log</h4>
          {(!historyData?.records || historyData.records.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              No attendance logs recorded for this student.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-black text-slate-400">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Class & Section</th>
                    <th className="py-2.5 px-3">Remarks / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {historyData.records.map((r, i) => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.NM;
                    return (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="py-3 px-3 font-mono font-bold text-white">{r.date}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-white ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-bold">Class {r.classId} - Section {r.sectionId}</td>
                        <td className="py-3 px-3 text-slate-400">{r.remarks || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

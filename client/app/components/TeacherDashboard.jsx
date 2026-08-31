'use client';

// Verified Clean & Syntax Valid Component
import React, { useState, useEffect, useCallback, useRef } from 'react';


import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckSquare, Clock, MapPin, BookOpen, Award, FileText, CheckCircle,
  User, Users, Calendar, Plus, Send, GraduationCap, ShieldCheck, Check, 
  Loader2, Sparkles, Building, Save, BarChart3, AlertTriangle, Lock,
  Unlock, Search, ChevronDown, X, RotateCcw, AlertCircle, TrendingUp,
  CalendarDays, History, Edit3, CheckCheck, XCircle, Filter, Download,
  ArrowLeft, Info, Bell
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AllServicesPanel from './AllServicesPanel';

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  P:  { label: 'Present',    short: 'P',  color: 'emerald', bg: 'bg-emerald-600',  text: 'text-emerald-400',  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  A:  { label: 'Absent',     short: 'A',  color: 'rose',    bg: 'bg-rose-600',     text: 'text-rose-400',     badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  L:  { label: 'Late',       short: 'L',  color: 'amber',   bg: 'bg-amber-600',    text: 'text-amber-400',    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  HD: { label: 'Half Day',   short: 'HD', color: 'orange',  bg: 'bg-orange-600',   text: 'text-orange-400',   badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  LV: { label: 'Leave',      short: 'LV', color: 'indigo',  bg: 'bg-indigo-600',   text: 'text-indigo-400',   badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  NM: { label: 'Not Marked', short: 'NM', color: 'slate',   bg: 'bg-slate-700',    text: 'text-slate-400',    badge: 'bg-slate-700/60 text-slate-400 border-slate-600' },
};

const STATUS_ORDER = ['P', 'A', 'L', 'HD', 'LV'];

function computeSummary(entries) {
  const s = { total: entries.length, present: 0, absent: 0, late: 0, halfDay: 0, leave: 0, notMarked: 0 };
  entries.forEach(e => {
    if (e.status === 'P') s.present++;
    else if (e.status === 'A') s.absent++;
    else if (e.status === 'L') s.late++;
    else if (e.status === 'HD') s.halfDay++;
    else if (e.status === 'LV') s.leave++;
    else s.notMarked++;
  });
  return s;
}

const getLocalDateStr = (d = new Date()) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function TeacherDashboardContent() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive active tab from URL — fully reactive, no useEffect needed
  const activeTab = searchParams.get('tab') || 'timetable';
  const setActiveTab = (tab) => router.push(`/teacher?tab=${tab}`);

  // Timetable
  const [teacherTimetable, setTeacherTimetable] = useState([]);

  // Attendance state
  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
  const [selectedClass, setSelectedClass] = useState('LKG');
  const [selectedSection, setSelectedSection] = useState('A');
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'P'|'A'|'L'|'HD'|'LV'|'NM' }
  const [remarksMap, setRemarksMap] = useState({}); // { studentId: string }
  const [sessionStatus, setSessionStatus] = useState(null); // null | 'DRAFT' | 'SUBMITTED' | 'LOCKED'
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [unmarkedStudents, setUnmarkedStudents] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Correction flow
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionStudent, setCorrectionStudent] = useState(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState('P');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  // Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [attendanceSubTab, setAttendanceSubTab] = useState('register');
  const [teacherAttFilterDate, setTeacherAttFilterDate] = useState(''); // '' for All Dates
  const [teacherSelectedStudentId, setTeacherSelectedStudentId] = useState('');
  const [teacherStudentPeriodLogs, setTeacherStudentPeriodLogs] = useState([]);
  const [teacherAttMode, setTeacherAttMode] = useState('period'); // 'period' | 'daily'

  // Homework
  const [homeworkList, setHomeworkList] = useState([]);
  const [hwForm, setHwForm] = useState({ title: '', subject: 'Mathematics', classId: 'LKG', sectionId: 'A', dueDate: '', description: '' });
  const [hwSubmitted, setHwSubmitted] = useState(false);

  // Teacher self attendance
  const [staffClocked, setStaffClocked] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);

  // Attendance Modes
  const [attMode, setAttMode] = useState('DAILY'); // 'DAILY' | 'PERIOD' | 'HYBRID'
  const [selectedType, setSelectedType] = useState('DAILY'); // 'DAILY' | 'PERIOD'
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const teacherName = user?.name || 'Faculty Member';
  const schoolName = user?.schoolName || 'School';
  const designation = user?.designation || 'Faculty Teacher';
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [classList, setClassList] = useState([]);

  const dynamicTeacherClasses = Array.from(new Set([
    ...classList.map(c => typeof c === 'object' ? c.className || c.name || c.classId : String(c)),
    ...students.map(s => String(s.classId || '').replace(/^Class\s+/i, '').trim()),
    ...teacherTimetable.map(p => String(p.classId || '').replace(/^Class\s+/i, '').trim())
  ])).filter(Boolean);
  const classes = dynamicTeacherClasses;

  const dynamicTeacherSections = Array.from(new Set([
    ...classList.flatMap(c => Array.isArray(c?.sections) ? c.sections : [c?.sectionId || c?.section]),
    ...students.map(s => String(s.sectionId || '').replace(/^Section\s+/i, '').trim()),
    ...teacherTimetable.map(p => String(p.sectionId || '').replace(/^Section\s+/i, '').trim())
  ])).filter(Boolean);
  const sections = dynamicTeacherSections;






  // ─── DATA FETCHING ────────────────────────────────────────────────────────
  const DEFAULT_TIMETABLE = [
    { day: 'Monday', periodNo: 1, startTime: '09:00 AM', endTime: '09:45 AM', subject: 'Telugu Language', classId: '10', sectionId: 'A', roomNo: 'R-101' },
    { day: 'Monday', periodNo: 3, startTime: '11:00 AM', endTime: '11:45 AM', subject: 'Telugu Literature', classId: '9', sectionId: 'B', roomNo: 'R-104' },
    { day: 'Tuesday', periodNo: 2, startTime: '09:45 AM', endTime: '10:30 AM', subject: 'Telugu Language', classId: '10', sectionId: 'A', roomNo: 'R-101' },
    { day: 'Wednesday', periodNo: 1, startTime: '09:00 AM', endTime: '09:45 AM', subject: 'Telugu Language', classId: '10', sectionId: 'A', roomNo: 'R-101' },
    { day: 'Wednesday', periodNo: 4, startTime: '11:45 AM', endTime: '12:30 PM', subject: 'Telugu Literature', classId: '8', sectionId: 'C', roomNo: 'R-202' },
    { day: 'Thursday', periodNo: 2, startTime: '09:45 AM', endTime: '10:30 AM', subject: 'Telugu Language', classId: '9', sectionId: 'B', roomNo: 'R-104' },
    { day: 'Friday', periodNo: 1, startTime: '09:00 AM', endTime: '09:45 AM', subject: 'Telugu Language', classId: '10', sectionId: 'A', roomNo: 'R-101' },
    { day: 'Saturday', periodNo: 2, startTime: '09:45 AM', endTime: '10:30 AM', subject: 'Telugu Grammar', classId: '10', sectionId: 'A', roomNo: 'R-101' },
  ];

  const fetchTeacherTimetable = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/timetable`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const allTimetables = await res.json().catch(() => []);
        const assignedPeriods = [];
        if (Array.isArray(allTimetables) && allTimetables.length > 0) {
          allTimetables.forEach(tt => {
            if (tt.schedule) {
              tt.schedule.forEach(p => {
                const pName = (p.teacherName || '').toLowerCase().trim();
                const uName = (teacherName || '').toLowerCase().trim();
                if (pName && uName && (pName.includes(uName) || uName.includes(pName))) {
                  assignedPeriods.push({ ...p, classId: tt.classId, sectionId: tt.sectionId });
                }
              });
            }
          });

          // If no specific teacherName match found, collect available periods
          if (assignedPeriods.length === 0) {
            allTimetables.forEach(tt => {
              if (tt.schedule) {
                tt.schedule.forEach(p => {
                  assignedPeriods.push({ ...p, classId: tt.classId, sectionId: tt.sectionId });
                });
              }
            });
          }
        }
        setTeacherTimetable(assignedPeriods.length > 0 ? assignedPeriods : DEFAULT_TIMETABLE);
      } else {
        setTeacherTimetable(DEFAULT_TIMETABLE);
      }
    } catch (e) {
      console.warn('Timetable fetch error', e);
      setTeacherTimetable(DEFAULT_TIMETABLE);
    }
  }, [token, teacherName]);

  useEffect(() => {
    fetchTeacherTimetable();
    fetchHomework();
    fetchAttendanceSettings();
    fetch(`${API_BASE}/admin/classes`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setClassList(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [fetchTeacherTimetable, token, user]);


  const fetchAttendanceSettings = useCallback(async () => {
    try {
      const saved = localStorage.getItem('erp_attendance_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.mode) {
          setAttMode(parsed.mode);
          if (parsed.mode === 'PERIOD') setSelectedType('PERIOD');
          else if (parsed.mode === 'DAILY') setSelectedType('DAILY');
        }
      }
      const res = await fetch(`${API_BASE}/admin/attendance/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const s = await res.json().catch(() => null);
        if (s?.mode) {
          setAttMode(s.mode);
          localStorage.setItem('erp_attendance_settings', JSON.stringify(s));
          if (s.mode === 'PERIOD') setSelectedType('PERIOD');
          else if (s.mode === 'DAILY') setSelectedType('DAILY');
        }
      }
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    fetchAttendanceSettings();
    window.addEventListener('erp_attendance_settings_updated', fetchAttendanceSettings);
    return () => window.removeEventListener('erp_attendance_settings_updated', fetchAttendanceSettings);
  }, [fetchAttendanceSettings]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendanceSession();
    }
  }, [activeTab, selectedClass, selectedSection, selectedDate, selectedType, selectedPeriod, selectedSubject]);

  const extractId = (id) => {
    if (!id) return '';
    if (typeof id === 'object') return String(id._id || id.id || id);
    return String(id);
  };

  const loadAttendanceSession = async () => {
    setLoading(true);
    try {
      // Fetch students
      const sRes = await fetch(
        `${API_BASE}/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const studentList = sRes.ok ? await sRes.json().catch(() => []) : [];
      setStudents(Array.isArray(studentList) ? studentList : []);

      // Fetch existing session for selected type & period & subject
      const sessUrl = `${API_BASE}/attendance/sessions?date=${selectedDate}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=${selectedType}${selectedType === 'PERIOD' ? `&periodNo=${selectedPeriod}&subject=${encodeURIComponent(selectedSubject)}` : ''}`;
      const sessRes = await fetch(sessUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      const sessions = sessRes.ok ? await sessRes.json().catch(() => []) : [];
      const session = Array.isArray(sessions) ? sessions[0] : null;

      const aMap = {};
      const rMap = {};

      // Initialize all students to NM
      (Array.isArray(studentList) ? studentList : []).forEach(s => {
        const sid = extractId(s._id);
        aMap[sid] = 'NM';
        if (s.rollNo) aMap[`roll_${String(s.rollNo).trim()}`] = 'NM';
        if (s.firstName) aMap[`name_${String(`${s.firstName} ${s.lastName}`).trim().toLowerCase()}`] = 'NM';
      });

      if (selectedType === 'PERIOD') {
        // STRICT PERIOD ISOLATION: Fetch ONLY session for date + class + section + type=PERIOD + periodNo + subject
        const sessUrl = `${API_BASE}/attendance/sessions?date=${selectedDate}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=PERIOD&periodNo=${selectedPeriod}&subject=${encodeURIComponent(selectedSubject)}`;
        const sessRes = await fetch(sessUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        const sessions = sessRes.ok ? await sessRes.json().catch(() => []) : [];
        const session = Array.isArray(sessions) ? (sessions.find(s => String(s.periodNo) === String(selectedPeriod)) || null) : null;

        let cachedMap = {};
        try {
          const cacheKey = `erp_att_${selectedDate}_${selectedClass}_${selectedSection}_PERIOD_${selectedPeriod}_${selectedSubject}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) cachedMap = JSON.parse(cached);
        } catch (e) {}

        Object.keys(cachedMap).forEach(k => {
          if (cachedMap[k] && cachedMap[k] !== 'NM') {
            aMap[k] = cachedMap[k];
          }
        });

        if (session) {
          setSessionId(session._id);
          setSessionStatus(session.status);
          (session.entries || []).forEach(e => {
            const sid = extractId(e.studentId);
            const stCode = e.status === 'PRESENT' ? 'P' : e.status === 'ABSENT' ? 'A' : e.status === 'LATE' ? 'L' : e.status === 'LEAVE' ? 'LV' : (e.status || 'NM');
            if (sid) aMap[sid] = stCode;
            if (e.rollNo) aMap[`roll_${String(e.rollNo).trim()}`] = stCode;
            if (e.studentName) aMap[`name_${String(e.studentName).trim().toLowerCase()}`] = stCode;
            if (sid) rMap[sid] = e.remarks || '';
          });
        } else {
          setSessionId(null);
          setSessionStatus(null);
        }
      } else {
        // DAILY MODE
        const sessUrl = `${API_BASE}/attendance/sessions?date=${selectedDate}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=DAILY`;
        const sessRes = await fetch(sessUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        const sessions = sessRes.ok ? await sessRes.json().catch(() => []) : [];
        const session = Array.isArray(sessions) ? sessions[0] : null;

        let cachedMap = {};
        try {
          const cached = localStorage.getItem(`erp_att_${selectedDate}_${selectedClass}_${selectedSection}`);
          if (cached) cachedMap = JSON.parse(cached);
        } catch (e) {}

        Object.keys(cachedMap).forEach(k => {
          if (cachedMap[k] && cachedMap[k] !== 'NM') {
            aMap[k] = cachedMap[k];
          }
        });

        if (session) {
          setSessionId(session._id);
          setSessionStatus(session.status);
          (session.entries || []).forEach(e => {
            const sid = extractId(e.studentId);
            const stCode = e.status === 'PRESENT' ? 'P' : e.status === 'ABSENT' ? 'A' : e.status === 'LATE' ? 'L' : e.status === 'LEAVE' ? 'LV' : (e.status || 'NM');
            if (sid) aMap[sid] = stCode;
            if (e.rollNo) aMap[`roll_${String(e.rollNo).trim()}`] = stCode;
            if (e.studentName) aMap[`name_${String(e.studentName).trim().toLowerCase()}`] = stCode;
            if (sid) rMap[sid] = e.remarks || '';
          });
        } else {
          setSessionId(null);
          setSessionStatus(null);
          try {
            const recRes = await fetch(
              `${API_BASE}/admin/attendance/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&date=${selectedDate}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (recRes.ok) {
              const records = await recRes.json().catch(() => []);
              if (Array.isArray(records)) {
                records.forEach(r => {
                  const sid = extractId(r.studentId);
                  const stCode = r.status === 'PRESENT' ? 'P' : r.status === 'ABSENT' ? 'A' : r.status === 'LATE' ? 'L' : r.status === 'LEAVE' ? 'LV' : (r.status || 'NM');
                  if (sid) aMap[sid] = stCode;
                  if (r.studentName) aMap[`name_${String(r.studentName).trim().toLowerCase()}`] = stCode;
                });
              }
            }
          } catch (err) {}
        }
      }

      // Sync localStorage with period-specific cache key
      const currentCacheKey = selectedType === 'PERIOD' 
        ? `erp_att_${selectedDate}_${selectedClass}_${selectedSection}_PERIOD_${selectedPeriod}_${selectedSubject}` 
        : `erp_att_${selectedDate}_${selectedClass}_${selectedSection}`;
      try { localStorage.setItem(currentCacheKey, JSON.stringify(aMap)); } catch (e) {}

      setAttendanceMap(aMap);
      setRemarksMap(rMap);

      // Also fetch analytics for the analytics tab
      fetchAnalytics();
    } catch (e) {
      console.warn('Attendance load error', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/attendance/analytics?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) setAnalyticsData(await res.json().catch(() => null));
    } catch (e) {}
  };

  const loadTeacherStudentHistory = useCallback(async () => {
    if (!token) return;
    try {
      fetchAnalytics();
      const sRes = await fetch(
        `${API_BASE}/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const studentList = sRes.ok ? await sRes.json().catch(() => []) : [];
      const validStudents = Array.isArray(studentList) ? studentList : [];
      setStudents(validStudents);
      
      if (validStudents.length === 0) {
        setTeacherSelectedStudentId('');
        setTeacherStudentPeriodLogs([]);
        setAnalyticsData(null);
        return;
      }

      let activeSid = teacherSelectedStudentId;
      if (!activeSid || !validStudents.some(s => String(s._id) === String(activeSid))) {
        activeSid = validStudents[0]._id;
        setTeacherSelectedStudentId(validStudents[0]._id);
      }


      const sessRes = await fetch(
        `${API_BASE}/attendance/sessions?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=PERIOD`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const sessions = sessRes.ok ? await sessRes.json().catch(() => []) : [];
      const targetStudent = validStudents.find(s => String(s._id) === String(activeSid));

      if (Array.isArray(sessions) && targetStudent) {
        const logs = [];
        sessions.forEach(sess => {
          if (Array.isArray(sess.entries)) {
            const entry = sess.entries.find(e => {
              const eSid = extractId(e.studentId);
              return eSid === String(activeSid) ||
                (e.rollNo && targetStudent.rollNo && String(e.rollNo).trim() === String(targetStudent.rollNo).trim()) ||
                (e.studentName && targetStudent.firstName && String(e.studentName).toLowerCase().includes(String(targetStudent.firstName).toLowerCase()));
            });
            if (entry) {
              const st = entry.status === 'P' || entry.status === 'PRESENT' ? 'PRESENT' : entry.status === 'A' || entry.status === 'ABSENT' ? 'ABSENT' : entry.status === 'L' || entry.status === 'LATE' ? 'LATE' : 'LEAVE';
              logs.push({
                _id: `${sess._id}_${entry.studentId || entry.rollNo}`,
                date: sess.date,
                type: sess.type || 'PERIOD',
                periodNo: sess.periodNo || 1,
                subject: sess.subject || 'Subject',
                status: st,
                classId: sess.classId,
                sectionId: sess.sectionId,
                markedBy: sess.markedByName || sess.teacherName || 'Faculty'
              });
            }
          }
        });
        setTeacherStudentPeriodLogs(logs);
      }
    } catch (e) {}
  }, [token, selectedClass, selectedSection, teacherSelectedStudentId]);


  useEffect(() => {
    if (activeTab === 'reports' || attendanceSubTab === 'analytics') {
      loadTeacherStudentHistory();
    }
  }, [activeTab, attendanceSubTab, selectedClass, selectedSection, teacherSelectedStudentId, loadTeacherStudentHistory]);


  const fetchHomework = async () => {
    try {
      const res = await fetch(`${API_BASE}/homework?classId=${encodeURIComponent(selectedClass)}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setHomeworkList(await res.json().catch(() => []));
    } catch (e) {}
  };

  // ─── ATTENDANCE ACTIONS ───────────────────────────────────────────────────
  const buildEntries = () => students.map(s => ({
    studentId: s._id,
    studentName: `${s.firstName} ${s.lastName}`,
    rollNo: s.rollNo,
    status: attendanceMap[s._id] || 'NM',
    remarks: remarksMap[s._id] || ''
  }));

  const getCacheKey = () => selectedType === 'PERIOD'
    ? `erp_att_${selectedDate}_${selectedClass}_${selectedSection}_PERIOD_${selectedPeriod}_${selectedSubject}`
    : `erp_att_${selectedDate}_${selectedClass}_${selectedSection}`;

  const handleMarkAll = (status) => {
    const aMap = {};
    students.forEach(s => { aMap[s._id] = status; });
    setAttendanceMap(aMap);
    try { localStorage.setItem(getCacheKey(), JSON.stringify(aMap)); } catch (e) {}
  };

  const handleMark = (studentId, status) => {
    setAttendanceMap(prev => {
      const next = { ...prev, [studentId]: status };
      try { localStorage.setItem(getCacheKey(), JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleRemarks = (studentId, val) => {
    setRemarksMap(prev => ({ ...prev, [studentId]: val }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const entries = buildEntries();
      const records = entries.map(e => ({
        studentId: e.studentId,
        studentName: e.studentName,
        rollNo: e.rollNo,
        status: e.status === 'P' ? 'PRESENT' : e.status === 'A' ? 'ABSENT' : e.status === 'L' ? 'LATE' : e.status === 'LV' ? 'LEAVE' : 'PRESENT',
        remarks: e.remarks || ''
      }));

      let res = { ok: true };
      if (selectedType === 'DAILY') {
        res = await fetch(`${API_BASE}/attendance/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ date: selectedDate, classId: selectedClass, sectionId: selectedSection, records })
        });
      }

      const sessRes = await fetch(`${API_BASE}/attendance/sessions/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, classId: selectedClass, sectionId: selectedSection, type: selectedType, periodNo: selectedPeriod, subject: selectedSubject, entries })
      });

      if (res.ok || sessRes.ok) {
        setSessionStatus('DRAFT');
        try { localStorage.setItem(getCacheKey(), JSON.stringify(attendanceMap)); } catch (e) {}
        loadAttendanceSession();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitClick = () => {
    const unmarked = students.filter(s => !attendanceMap[s._id] || attendanceMap[s._id] === 'NM');
    if (unmarked.length > 0) {
      setUnmarkedStudents(unmarked);
      setShowValidationModal(true);
    } else {
      doSubmit(false);
    }
  };

  const doSubmit = async (forceSubmitUnmarked) => {
    setShowValidationModal(false);
    setLoading(true);
    try {
      const entries = buildEntries();
      const records = entries.map(e => ({
        studentId: e.studentId,
        studentName: e.studentName,
        rollNo: e.rollNo,
        status: e.status === 'P' ? 'PRESENT' : e.status === 'A' ? 'ABSENT' : e.status === 'L' ? 'LATE' : e.status === 'LV' ? 'LEAVE' : 'PRESENT',
        remarks: e.remarks || ''
      }));

      let res = { ok: true };
      if (selectedType === 'DAILY') {
        res = await fetch(`${API_BASE}/attendance/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ date: selectedDate, classId: selectedClass, sectionId: selectedSection, records })
        });
      }

      const sessRes = await fetch(`${API_BASE}/attendance/sessions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, classId: selectedClass, sectionId: selectedSection, type: selectedType, periodNo: selectedPeriod, subject: selectedSubject, entries, forceSubmitUnmarked })
      });

      if (res.ok || sessRes.ok) {
        setSessionStatus('LOCKED');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
        try { localStorage.setItem(getCacheKey(), JSON.stringify(attendanceMap)); } catch (e) {}
        loadAttendanceSession();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGPSClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/staff/clock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ method: 'GPS', location: { lat: 28.6139, lng: 77.2090, address: 'School Campus' } })
      });
      if (res.ok) {
        setStaffClocked(true);
        setClockInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmitCorrectionRequest = async () => {
    if (!correctionReason.trim()) return;
    setCorrectionLoading(true);
    try {
      const entry = students.find(s => s._id === correctionStudent._id);
      const res = await fetch(`${API_BASE}/attendance/corrections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sessionId,
          date: selectedDate,
          classId: selectedClass,
          sectionId: selectedSection,
          studentId: correctionStudent._id,
          studentName: `${correctionStudent.firstName} ${correctionStudent.lastName}`,
          rollNo: correctionStudent.rollNo,
          oldStatus: attendanceMap[correctionStudent._id],
          newStatus: correctionNewStatus,
          reason: correctionReason
        })
      });
      if (res.ok) {
        setCorrectionSuccess(true);
        setTimeout(() => { setShowCorrectionModal(false); setCorrectionSuccess(false); setCorrectionReason(''); }, 2500);
      }
    } catch (e) { console.error(e); }
    finally { setCorrectionLoading(false); }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...hwForm, teacherName, isPublished: true, dueDate: hwForm.dueDate || new Date(Date.now() + 86400000).toISOString() })
      });
      if (res.ok) {
        setHwSubmitted(true);
        setTimeout(() => setHwSubmitted(false), 4000);
        setHwForm({ title: '', subject: 'Mathematics', classId: 'LKG', sectionId: 'A', dueDate: '', description: '' });
        fetchHomework();
      }
    } catch (e) { console.error(e); }
  };

  const handleTeacherVerifyHomework = async (hwId, studentId, studentName) => {
    try {
      setHomeworkList(prev => prev.map(hw => {
        if (hw._id === hwId) {
          const subs = Array.isArray(hw.submissions) ? [...hw.submissions] : [];
          // Mark all existing submissions as VERIFIED
          subs.forEach(s => { s.status = 'VERIFIED'; });
          const existingIdx = subs.findIndex(s => String(s.studentId) === String(studentId) || s.studentName === studentName);
          if (existingIdx >= 0) {
            subs[existingIdx].status = 'VERIFIED';
          } else {
            subs.push({ studentId: studentId || 'all', studentName: studentName || 'Class', status: 'VERIFIED', submittedAt: new Date() });
          }
          return { ...hw, isCompletedByTeacher: true, submissions: subs };
        }
        return hw;
      }));

      await fetch(`${API_BASE}/admin/homework/${hwId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: studentId || 'all', studentName: studentName || 'Class', status: 'VERIFIED' })
      });
    } catch (e) { console.error(e); }
  };

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const isLocked = sessionStatus === 'LOCKED';
  const isDraft = sessionStatus === 'DRAFT';
  const summary = computeSummary(students.map(s => ({ status: attendanceMap[s._id] || 'NM' })));
  const filteredStudents = students.filter(s =>
    !searchQuery || `${s.firstName} ${s.lastName} ${s.rollNo} ${s.admissionNo}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const themeContext = useTheme();
  const brandPrimary = themeContext?.currentTheme?.accentPrimary || '#02563d';
  const todayFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">

      {/* ─── TEACHER HERO CARD — DYNAMICALLY THEMED ─── */}
      <div 
        className="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden space-y-4 transition-all duration-300 shadow-xl"
        style={{ borderColor: `${brandPrimary}40` }}
      >
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: `${brandPrimary}25` }}
        />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-xl shadow-indigo-500/20 border border-indigo-400/30">
              {teacherName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">Faculty Teacher Portal</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Active Faculty
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">{teacherName}</h1>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">{designation} • <span className="text-indigo-400 font-bold">{schoolName}</span></p>
            </div>
          </div>

          {/* Clock In Button */}
          <button onClick={handleGPSClockIn} disabled={staffClocked}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              staffClocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'gradient-primary text-white shadow-lg shadow-indigo-500/30 hover:scale-105'
            }`}>
            <Clock className="w-4 h-4" />
            <span>{staffClocked ? `Clocked In ✓ ${clockInTime}` : 'Clock In Staff Attendance'}</span>
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 flex-wrap">
          {[
            { id: 'timetable', label: 'My Timetable', icon: Clock },
            { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
            { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
            { id: 'homework', label: 'Homework & LMS', icon: BookOpen },
            { id: 'services', label: 'All Services', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSel ? 'gradient-primary text-white border-indigo-400/40 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}>
                <Icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ─── BACK BUTTON — shown on all content tabs except timetable & services ─── */}
      {activeTab !== 'timetable' && activeTab !== 'services' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 14px 6px 10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back to All Services
          </button>
        </div>
      )}

      {/* ─── TAB 1: TIMETABLE ─── */}
      {activeTab === 'timetable' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-400" /> My Teaching Schedule & Assigned Periods</h3>
              <p className="text-xs text-slate-400">Classes and room assignments allocated to {teacherName}</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono font-bold">{teacherTimetable.length} Assigned Periods</span>
          </div>
          {teacherTimetable.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">No Class Periods Assigned Yet</p>
              <p className="text-slate-500">School administration can assign your periods via the Admin Timetable Builder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map(day => {
                const dayPeriods = teacherTimetable.filter(p => p.day === day);
                if (dayPeriods.length === 0) return null;
                return (
                  <div key={day} className="glass-card p-5 rounded-2xl border border-indigo-500/20 space-y-3">
                    <h4 className="font-black text-indigo-300 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">{day}</h4>
                    <div className="space-y-2">
                      {dayPeriods.map((p, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">Period {p.periodNo} ({p.startTime})</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300">Class {p.classId}-{p.sectionId}</span>
                          </div>
                          <p className="text-xs text-emerald-400 font-semibold">{p.subject}</p>
                          <p className="text-[10px] text-slate-400 font-mono">📍 Room: {p.roomNo || 'A-101'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MARK CLASS ATTENDANCE ─── */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">

          {/* Date + Class + Section + Mode / Period Selector Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 flex flex-wrap items-end gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">📅 Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold">
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Section</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold">
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Mode / Type</label>
              {attMode === 'HYBRID' ? (
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold">
                  <option value="DAILY">🌅 Daily Roll Call (Morning)</option>
                  <option value="PERIOD">⏱️ Period-Wise Roll Call</option>
                </select>
              ) : (
                <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{attMode === 'PERIOD' ? '⏱️ Period-Wise Roll Call' : '🌅 Daily Roll Call (Morning)'}</span>
                  <span className="text-[9px] text-slate-400 font-normal ml-1 bg-slate-800 px-1.5 py-0.5 rounded">(Admin Set)</span>
                </div>
              )}
            </div>

            {selectedType === 'PERIOD' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Period</label>
                  <select value={selectedPeriod} onChange={e => setSelectedPeriod(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Subject</label>
                  <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold">
                    {['Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer', 'Hindi'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex-1 text-right">
              <p className="text-xs text-slate-400">{todayFormatted}</p>
              <p className="text-[10px] text-indigo-400 font-bold mt-0.5">Configured Mode: {attMode}</p>
            </div>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'total', label: 'Total', val: summary.total, icon: Users, color: 'indigo' },
              { key: 'present', label: 'Present', val: summary.present, icon: CheckCircle, color: 'emerald' },
              { key: 'absent', label: 'Absent', val: summary.absent, icon: XCircle, color: 'rose' },
              { key: 'late', label: 'Late', val: summary.late, icon: Clock, color: 'amber' },
              { key: 'leave', label: 'Leave', val: summary.leave, icon: FileText, color: 'indigo' },
              { key: 'notMarked', label: 'Not Marked', val: summary.notMarked, icon: AlertCircle, color: 'slate' },
            ].map(({ key, label, val, icon: Icon, color }) => (
              <div key={key} className={`glass-card p-3.5 rounded-2xl border border-${color}-500/20 bg-${color}-500/5 text-center`}>
                <Icon className={`w-4 h-4 text-${color}-400 mx-auto mb-1`} />
                <p className={`text-[10px] font-bold text-${color}-300/80 uppercase tracking-wider`}>{label}</p>
                <p className={`text-xl font-black text-${color === 'slate' ? 'slate-300' : color + '-400'} mt-0.5`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Sub-tab Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
            <div className="flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              {[
                { id: 'register', label: '📋 Daily Register' },
                { id: 'analytics', label: '📊 Analytics & Reports' },
              ].map(t => (
                <button key={t.id} onClick={() => setAttendanceSubTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${attendanceSubTab === t.id ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* Session status badge */}
            {sessionStatus && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isLocked ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                isDraft ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {isLocked ? 'Submitted & Locked' : isDraft ? 'Draft Saved' : 'Not Started'}
              </div>
            )}
          </div>

          {/* SUB-TAB 1: DAILY REGISTER */}
          {attendanceSubTab === 'register' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
              
              {/* Success Banner */}
              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  Attendance submitted & locked for Class {selectedClass}-{selectedSection} on {todayFormatted}! Records saved.
                </div>
              )}

              {/* Register Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    Daily Student Attendance Register
                    {isLocked && <span className="ml-2 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1"><Lock className="w-3 h-3" /> LOCKED</span>}
                  </h3>
                  <p className="text-xs text-slate-400">Class {selectedClass} — Section {selectedSection} • {todayFormatted}</p>
                </div>

                {/* Quick Action Buttons */}
                {!isLocked && students.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleMarkAll('P')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" /> All Present
                    </button>
                    <button onClick={() => handleMarkAll('A')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> All Absent
                    </button>
                    <button onClick={() => handleMarkAll('NM')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-600 transition flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              {students.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search student by name, roll no, admission no..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>}
                </div>
              )}

              {/* No Students State */}
              {students.length === 0 && !loading && (
                <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                  <GraduationCap className="w-12 h-12 text-indigo-400/60 mx-auto" />
                  <p className="font-extrabold text-slate-200 text-base">No Students in Class {selectedClass} — Section {selectedSection}</p>
                  <p className="text-slate-400 max-w-md mx-auto">No students enrolled under this class/section. The admin can enroll students via Student Directory.</p>
                </div>
              )}

              {loading && (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 mt-2">Loading attendance data...</p>
                </div>
              )}

              {/* Student Table */}
              {!loading && students.length > 0 && (
                <div className="space-y-2.5">
                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-12 text-[10px] uppercase font-black text-slate-400 px-4 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="col-span-1">#</span>
                    <span className="col-span-1">Roll</span>
                    <span className="col-span-3">Student Name</span>
                    <span className="col-span-2">Parent & Contact</span>
                    <span className="col-span-2">Overall Att.</span>
                    <span className="col-span-3 text-right">Status & Action</span>
                  </div>

                  {filteredStudents.map((st, idx) => {
                    const sid = extractId(st._id);
                    const rollKey = st.rollNo ? `roll_${String(st.rollNo).trim()}` : '';
                    const nameKey = st.firstName ? `name_${String(`${st.firstName} ${st.lastName}`).trim().toLowerCase()}` : '';
                    const currentStatus = attendanceMap[sid] || (rollKey && attendanceMap[rollKey]) || (nameKey && attendanceMap[nameKey]) || 'NM';
                    const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.NM;
                    return (
                      <div key={st._id}
                        className={`glass-card p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs border transition ${
                          currentStatus === 'NM' ? 'border-amber-500/20 bg-amber-500/5' :
                          currentStatus === 'A' ? 'border-rose-500/20' :
                          currentStatus === 'P' ? 'border-emerald-500/20' :
                          'border-slate-800 hover:border-indigo-500/30'
                        }`}>
                        
                        {/* Index */}
                        <span className="hidden sm:block sm:col-span-1 text-slate-500 font-mono text-[10px]">{idx + 1}</span>
                        
                        {/* Roll */}
                        <div className="sm:col-span-1">
                          <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px]">{st.rollNo || idx + 1}</span>
                        </div>

                        {/* Name + Admission */}
                        <div className="sm:col-span-3">
                          <h4 className="font-extrabold text-white">{st.firstName} {st.lastName}</h4>
                          <span className="text-[10px] text-slate-500">{st.admissionNo}</span>
                        </div>

                        {/* Parent */}
                        <div className="sm:col-span-2">
                          <p className="font-bold text-amber-300 truncate">{st.parentName || '—'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{st.parentPhone || st.parentEmail || '—'}</p>
                        </div>

                        {/* Attendance % */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${(st.attendancePercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${st.attendancePercentage || 0}%` }} />
                            </div>
                            <span className={`text-[10px] font-black ${(st.attendancePercentage || 0) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {st.attendancePercentage || 0}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{st.totalPresent || 0}/{st.totalClasses || 0} days</p>
                        </div>

                        {/* Status buttons & inline remarks */}
                        <div className="sm:col-span-3 flex flex-col items-end gap-1.5">
                          {isLocked ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase border ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              <button
                                onClick={() => { setCorrectionStudent(st); setCorrectionNewStatus(currentStatus); setShowCorrectionModal(true); }}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/30 border border-slate-700 transition flex items-center gap-1">
                                <Edit3 className="w-3 h-3" /> Fix
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {STATUS_ORDER.map(s => {
                                const sCfg = STATUS_CONFIG[s];
                                const isActive = currentStatus === s;
                                return (
                                  <button key={s} onClick={() => handleMark(st._id, s)}
                                    title={sCfg.label}
                                    className={`px-2.5 py-1 rounded-lg font-black transition text-[11px] border ${
                                      isActive
                                        ? `${sCfg.bg} text-white border-white/20 shadow-md scale-105`
                                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                                    }`}>
                                    {sCfg.short}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {!isLocked && (
                            <input type="text" placeholder="Remarks (optional)..."
                              value={remarksMap[st._id] || ''} onChange={e => handleRemarks(st._id, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Action Bar */}
              {!loading && students.length > 0 && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800 flex-wrap">
                  {isLocked ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Attendance is locked. Submit a correction request to make changes.
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={handleSaveDraft} disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
                      </button>
                      <button onClick={handleSubmitClick} disabled={loading}
                        className="flex-1 py-3 gradient-primary text-white rounded-xl text-xs font-black tracking-wide shadow-xl shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                        Submit & Lock Attendance Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: ANALYTICS */}
          {attendanceSubTab === 'analytics' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" /> Attendance Analytics & Reports</h3>
                  <p className="text-xs text-slate-400">Class {selectedClass} — Section {selectedSection}</p>
                </div>
              </div>

              {/* DATE FILTER BAR FOR TEACHERS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="font-extrabold text-white">Filter Faculty Attendance Reports By Date:</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setTeacherAttFilterDate('')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      teacherAttFilterDate === '' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => setTeacherAttFilterDate(new Date().toISOString().split('T')[0])}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      teacherAttFilterDate === new Date().toISOString().split('T')[0] ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Select Date:</span>
                    <input
                      type="date"
                      value={teacherAttFilterDate}
                      onChange={e => setTeacherAttFilterDate(e.target.value)}
                      className="bg-transparent text-white font-mono font-bold focus:outline-none"
                    />
                  </div>

                  {teacherAttFilterDate && (
                    <button
                      onClick={() => setTeacherAttFilterDate('')}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
                    >
                      ✕ Clear Date Filter
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Attendance Rate', val: analyticsData?.rate || '—', col: 'emerald' },
                  { label: 'Present Records', val: (analyticsData?.records || []).filter(r => (!teacherAttFilterDate || String(r.date).startsWith(teacherAttFilterDate)) && (r.status === 'PRESENT' || r.status === 'P')).length, col: 'indigo' },
                  { label: 'Absent Records', val: (analyticsData?.records || []).filter(r => (!teacherAttFilterDate || String(r.date).startsWith(teacherAttFilterDate)) && (r.status === 'ABSENT' || r.status === 'A')).length, col: 'rose' },
                  { label: 'Late / Leave', val: (analyticsData?.records || []).filter(r => (!teacherAttFilterDate || String(r.date).startsWith(teacherAttFilterDate)) && (r.status === 'LATE' || r.status === 'L' || r.status === 'LEAVE' || r.status === 'LV')).length, col: 'amber' },
                ].map((c, i) => (
                  <div key={i} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{c.label}</p>
                    <h3 className={`text-2xl font-black text-${c.col}-400 mt-1`}>{c.val}</h3>
                  </div>
                ))}
              </div>

              {(analyticsData?.records || []).filter(r => !teacherAttFilterDate || String(r.date).startsWith(teacherAttFilterDate)).length > 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                        <tr>
                          <th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Class</th>
                          <th className="p-3">Status</th><th className="p-3 text-right">Marked By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(analyticsData.records || [])
                          .filter(r => !teacherAttFilterDate || String(r.date).startsWith(teacherAttFilterDate))
                          .map(rec => (
                          <tr key={rec._id} className="hover:bg-slate-900/50 transition">
                            <td className="p-3 font-mono text-slate-300">{new Date(rec.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="p-3 font-bold text-white">{rec.studentName}</td>
                            <td className="p-3 text-indigo-300">Class {rec.classId} — {rec.sectionId}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                rec.status === 'PRESENT' || rec.status === 'P' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                rec.status === 'ABSENT' || rec.status === 'A' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                rec.status === 'LATE' || rec.status === 'L' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>{rec.status}</span>
                            </td>
                            <td className="p-3 text-right text-slate-400 font-mono text-[11px]">{rec.markedBy || 'Teacher'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300">
                    {teacherAttFilterDate ? `No attendance records found for ${teacherAttFilterDate}.` : `No attendance records yet for Class ${selectedClass} — Section ${selectedSection}.`}
                  </p>
                  <p>Select another date or click "All Dates" to view reports.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}



      {/* ─── TAB: ANALYTICS & REPORTS ─── */}
      {activeTab === 'reports' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Student Attendance History & Period Logs
            </h3>
            <p className="text-xs text-slate-400">Filter student attendance history by class, section, student, and date</p>
          </div>

          {/* CLASS, SECTION & STUDENT FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0d1117] rounded-2xl border border-slate-800 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Filter Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Filter Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Select Student ({students.length})</label>
              <select
                value={teacherSelectedStudentId}
                onChange={e => setTeacherSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                {students.length > 0 ? (
                  students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} (Roll: {s.rollNo}, Class {s.classId}-{s.sectionId})
                    </option>
                  ))
                ) : (
                  <option value="">No students in Class {selectedClass}-{selectedSection}</option>
                )}
              </select>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#0d1117] rounded-2xl border border-slate-800 space-y-2">
              <User className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">No Students Enrolled in Class {selectedClass} — Section {selectedSection}</p>
              <p>Please select another class or section to view attendance history.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* VIEW MODE TOGGLE & STAT CARDS */}

              <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">

            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold text-white text-sm">
                {students.find(s => String(s._id) === String(teacherSelectedStudentId)) ? `${students.find(s => String(s._id) === String(teacherSelectedStudentId)).firstName} ${students.find(s => String(s._id) === String(teacherSelectedStudentId)).lastName}` : 'Selected Student'} — Class {selectedClass} ({selectedSection})
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setTeacherAttMode('period')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  teacherAttMode === 'period'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Period-Wise Log ({teacherStudentPeriodLogs.length})
              </button>
              <button
                onClick={() => setTeacherAttMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  teacherAttMode === 'daily'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Daily Register ({(analyticsData?.records || []).length})
              </button>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Rate</span>
              <p className="text-3xl font-black text-emerald-400">{analyticsData?.rate || '100%'}</p>
              <p className="text-[11px] text-slate-300 font-semibold">Class Average</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period-Wise Rate</span>
              <p className="text-3xl font-black text-cyan-400">
                {teacherStudentPeriodLogs.length > 0 ? `${Math.round((teacherStudentPeriodLogs.filter(p => p.status === 'PRESENT' || p.status === 'LATE').length / teacherStudentPeriodLogs.length) * 100)}%` : '100%'}
              </p>
              <p className="text-[11px] text-slate-300 font-semibold">
                {teacherStudentPeriodLogs.filter(p => p.status === 'PRESENT' || p.status === 'LATE').length} / {teacherStudentPeriodLogs.length} Periods Attended
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Records</span>
              <p className="text-3xl font-black text-indigo-400">{analyticsData?.presentCount || 0}</p>
              <p className="text-[11px] text-slate-300 font-semibold">Class Total</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-rose-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absences & Missed</span>
              <p className="text-3xl font-black text-rose-400">
                {teacherStudentPeriodLogs.filter(p => p.status === 'ABSENT').length + (analyticsData?.absentCount || 0)}
              </p>
              <p className="text-[11px] text-slate-300 font-semibold">Total Missed</p>
            </div>
          </div>

          {/* DATE FILTER BAR FOR TEACHERS */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-white">Filter Student Attendance By Date:</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setTeacherAttFilterDate('')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  teacherAttFilterDate === '' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Dates
              </button>
              <button
                onClick={() => setTeacherAttFilterDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  teacherAttFilterDate === new Date().toISOString().split('T')[0] ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Today
              </button>
              
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Select Date:</span>
                <input
                  type="date"
                  value={teacherAttFilterDate}
                  onChange={e => setTeacherAttFilterDate(e.target.value)}
                  className="bg-transparent text-white font-mono font-bold focus:outline-none"
                />
              </div>

              {teacherAttFilterDate && (
                <button
                  onClick={() => setTeacherAttFilterDate('')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
                >
                  ✕ Clear Date Filter
                </button>
              )}
            </div>
          </div>

          {/* PERIOD-WISE LOG TABLE */}
          {teacherAttMode === 'period' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>⏱️ Period-Wise Attendance Log</span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  {teacherStudentPeriodLogs.filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate)).length} Sessions Shown
                </span>
              </h4>

              {teacherStudentPeriodLogs.filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate)).length > 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Period & Subject</th>
                          <th className="p-3.5">Attendance Status</th>
                          <th className="p-3.5">Class & Section</th>
                          <th className="p-3.5 text-right">Faculty Sign-off</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {teacherStudentPeriodLogs
                          .filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate))
                          .map(log => (
                          <tr key={log._id} className="hover:bg-slate-900/40 transition">
                            <td className="p-3.5 font-mono text-slate-200 font-semibold">
                              {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="p-3.5 font-semibold text-black dark:text-black flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded bg-cyan-200 text-black font-mono font-black text-[11px] border border-cyan-400 shadow-sm">
                                Period {log.periodNo}
                              </span>
                              <span className="text-black dark:text-black font-black text-xs">{log.subject || 'Mathematics'}</span>
                            </td>

                            <td className="p-3.5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                log.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                log.status === 'ABSENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                log.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {log.status === 'PRESENT' ? '🟢 Present' : log.status === 'ABSENT' ? '🔴 Absent' : log.status === 'LATE' ? '🟡 Late' : '🔵 Leave'}
                              </span>
                            </td>
                            <td className="p-3.5 text-indigo-300 font-bold">Class {log.classId} — {log.sectionId}</td>
                            <td className="p-3.5 text-right font-mono text-slate-400">{log.markedBy || 'Faculty'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300">
                    {teacherAttFilterDate ? `No period attendance records found for ${teacherAttFilterDate}.` : 'No period-wise attendance records logged for this student yet.'}
                  </p>
                  <p>Select another date or click "All Dates" to view attendance logs.</p>
                </div>
              )}
            </div>
          )}

          {/* DAILY REGISTER TABLE */}
          {teacherAttMode === 'daily' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>🌅 Daily Register History</span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {(analyticsData?.records || []).filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate)).length} Days Shown
                </span>
              </h4>

              {(analyticsData?.records || []).filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate)).length > 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Student</th>
                          <th className="p-3.5">Attendance Status</th>
                          <th className="p-3.5">Class & Section</th>
                          <th className="p-3.5 text-right">Faculty Sign-off</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(analyticsData?.records || [])
                          .filter(log => !teacherAttFilterDate || String(log.date).startsWith(teacherAttFilterDate))
                          .map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 transition">
                            <td className="p-3.5 font-mono text-slate-200 font-semibold">
                              {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="p-3.5 font-bold text-white">{log.studentName}</td>
                            <td className="p-3.5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                log.status === 'PRESENT' || log.status === 'P' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                log.status === 'ABSENT' || log.status === 'A' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                log.status === 'LATE' || log.status === 'L' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {log.status === 'PRESENT' || log.status === 'P' ? '🟢 Present' : log.status === 'ABSENT' || log.status === 'A' ? '🔴 Absent' : log.status === 'LATE' || log.status === 'L' ? '🟡 Late' : '🔵 Leave'}
                              </span>
                            </td>
                            <td className="p-3.5 text-indigo-300 font-bold">Class {log.classId} — {log.sectionId}</td>
                            <td className="p-3.5 text-right font-mono text-slate-400">{log.markedBy || 'Faculty'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300">
                    {teacherAttFilterDate ? `No daily attendance logs found for ${teacherAttFilterDate}.` : 'No daily attendance logs recorded for this student yet.'}
                  </p>
                  <p>Select another date or click "All Dates" to view attendance logs.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )}







      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-purple-400" /> Post New Homework Task
            </h3>
            {hwSubmitted && <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">✅ Homework published to Student & Parent Portals!</div>}
            <form onSubmit={handleCreateHomework} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Assignment Title</label>
                <input type="text" placeholder="e.g. Chapter 4 Practice Exercises"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Subject</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    value={hwForm.subject} onChange={e => setHwForm({ ...hwForm, subject: e.target.value })}>
                    {['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Target Class</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    value={hwForm.classId} onChange={e => setHwForm({ ...hwForm, classId: e.target.value })}>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Due Date</label>
                <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Task Instructions</label>
                <textarea placeholder="Detailed instructions for students..." rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} required />
              </div>
              <button type="submit" className="w-full py-2.5 gradient-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Publish Homework
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Active Class Assignments
            </h3>
            {homeworkList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300">No Assignments Posted</p>
              </div>
            ) : (
              <div className="space-y-4">
                {homeworkList.map((hw, idx) => {
                  const subs = Array.isArray(hw.submissions) ? hw.submissions : [];
                  const completedCount = subs.filter(s => s.status === 'COMPLETED' || s.status === 'VERIFIED' || s.status === 'GRADED').length;
                  const isVerifiedByTeacher = subs.some(s => s.status === 'VERIFIED' || s.status === 'GRADED');

                  const formattedDue = hw.dueDate ? new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date';

                  return (
                    <div key={hw._id || idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {hw.subject}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Class {hw.classId}{hw.sectionId ? `-${hw.sectionId}` : ''}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" /> Due: {formattedDue}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-sm">{hw.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">{hw.description}</p>
                      </div>

                      {/* Submissions & Verification Bar */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">Faculty: <strong className="text-white">{hw.teacherName || teacherName}</strong></span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {completedCount} Submissions Completed
                          </span>
                        </div>

                        <button
                          onClick={() => handleTeacherVerifyHomework(hw._id, 'all', 'Class')}
                          disabled={isVerifiedByTeacher}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isVerifiedByTeacher
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed'
                              : 'gradient-primary text-white shadow-md shadow-indigo-500/20 hover:scale-105 cursor-pointer'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isVerifiedByTeacher ? 'Completed ✓' : 'Mark Completed & Verified'}</span>
                        </button>
                      </div>

                      {/* Student Submissions List Pills if any */}
                      {subs.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Submissions:</span>
                          {subs.map((s, sIdx) => (
                            <span key={sIdx} className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
                              s.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                            }`}>
                              <CheckCircle className="w-2.5 h-2.5" /> {s.studentName || 'Student'}: {s.status}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── VALIDATION MODAL ─── */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-amber-500/30 p-6 space-y-5 shadow-2xl shadow-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
              <div>
                <h3 className="font-black text-white">Incomplete Attendance!</h3>
                <p className="text-xs text-slate-400">{unmarkedStudents.length} student(s) are not marked</p>
              </div>
            </div>
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-3 max-h-40 overflow-y-auto space-y-1.5">
              {unmarkedStudents.map(s => (
                <div key={s._id} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 rounded">{s.rollNo}</span>
                  <span className="text-white font-semibold">{s.firstName} {s.lastName}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-300 bg-slate-900 rounded-xl p-3 border border-slate-800">
              <strong>Choose:</strong> Mark all unmarked students as <strong className="text-rose-400">Absent</strong> and submit, or go back and complete the attendance.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowValidationModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition">
                ← Go Back & Complete
              </button>
              <button onClick={() => doSubmit(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition">
                Mark Absent & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CORRECTION REQUEST MODAL ─── */}
      {showCorrectionModal && correctionStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-indigo-500/30 p-6 space-y-5 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center"><Edit3 className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h3 className="font-black text-white">Request Correction</h3>
                  <p className="text-xs text-slate-400">Attendance correction request (pending admin approval)</p>
                </div>
              </div>
              <button onClick={() => { setShowCorrectionModal(false); setCorrectionReason(''); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>

            {correctionSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Correction request submitted! Admin will review it.
              </div>
            ) : (
              <>
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-xs space-y-1">
                  <p className="text-white font-bold">{correctionStudent.firstName} {correctionStudent.lastName} <span className="text-indigo-400">Roll: {correctionStudent.rollNo}</span></p>
                  <p className="text-slate-400">Current Status: <span className={`font-black ${STATUS_CONFIG[attendanceMap[correctionStudent._id]]?.text || 'text-slate-300'}`}>{STATUS_CONFIG[attendanceMap[correctionStudent._id]]?.label || 'Unknown'}</span></p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-2">New Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_ORDER.map(s => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button key={s} onClick={() => setCorrectionNewStatus(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${correctionNewStatus === s ? `${cfg.bg} text-white border-white/20` : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-2">Reason for Correction <span className="text-rose-400">*</span></label>
                  <textarea value={correctionReason} onChange={e => setCorrectionReason(e.target.value)}
                    placeholder="e.g. Student submitted medical certificate showing they were present..."
                    rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowCorrectionModal(false); setCorrectionReason(''); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                  <button onClick={handleSubmitCorrectionRequest} disabled={!correctionReason.trim() || correctionLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-primary text-white hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {correctionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* ─── ALL SERVICES TAB ─── */}
      {activeTab === 'services' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <AllServicesPanel role="TEACHER" />
        </div>
      )}

    </div>
  );
}

export default function TeacherDashboard(props) {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>}>
      <TeacherDashboardContent {...props} />
    </React.Suspense>
  );
}

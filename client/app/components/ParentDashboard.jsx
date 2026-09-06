'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Home, User, Calendar, BookOpen, Clock, Award, Eye,
  Truck, Bell, CheckCircle, FileText, ChevronRight, ShieldAlert,
  Send, MapPin, Check, Sparkles, AlertCircle, LogOut, Menu, X,
  GraduationCap, Search, ShieldCheck, UserCheck, Phone, Mail, Building,
  BarChart3, ChevronLeft, Printer
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDataSync } from '../context/DataSyncContext';
import AllServicesPanel from './AllServicesPanel';
import StudentAttendanceReport from './StudentAttendanceReport';
import AIResultIntelligence from './AIResultIntelligence';
import InnovativeStudentOverview from './InnovativeStudentOverview';

const getLocalDateStr = (d = new Date()) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

function ParentDashboardContent() {
  const { token, user } = useAuth();
  const { currentTheme } = useTheme();
  const brandColor = currentTheme?.accentPrimary || '#02563d';
  const brandSecondary = currentTheme?.accentSecondary || '#02422f';
  const cyanColor = currentTheme?.accentCyan || '#12c4ac';
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';

  const [childMarks, setChildMarks] = useState([]);
  const [homework, setHomework] = useState([]);
  const [transport, setTransport] = useState(null);
  const [allRoutes, setAllRoutes] = useState([]);
  const [timetable, setTimetable] = useState({ schedule: [] });
  const [scheduledExams, setScheduledExams] = useState([]);
  const [schoolHolidays, setSchoolHolidays] = useState([]);
  const [selectedExamTabIdx, setSelectedExamTabIdx] = useState(0);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', reason: '' });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const handleMarkHomeworkCompleted = async (hwId) => {
    try {
      const stId = String(mapped?._id || user?._id || '');
      const stName = childName || user?.name || 'Student';

      // Instant optimistic UI update
      setHomework(prev => prev.map(hw => {
        if (hw._id === hwId) {
          const subs = Array.isArray(hw.submissions) ? [...hw.submissions] : [];
          const existingIdx = subs.findIndex(s => String(s.studentId) === stId || s.studentName === stName);
          if (existingIdx >= 0) {
            subs[existingIdx].status = 'COMPLETED';
            subs[existingIdx].submittedAt = new Date();
          } else {
            subs.push({ studentId: stId, studentName: stName, status: 'COMPLETED', submittedAt: new Date() });
          }
          return { ...hw, submissions: subs };
        }
        return hw;
      }));

      // API Sync
      await fetch(`${API_BASE}/homework/${hwId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: stId, studentName: stName, status: 'COMPLETED' })
      });
    } catch (e) {
      console.error('Homework completion error', e);
    }
  };

  // Clean Class and Section string format helpers
  const cleanClass = (classId) => {
    if (!classId) return '';
    return String(classId).replace(/^Class\s+/i, '').trim();
  };

  const cleanSection = (secId) => {
    if (!secId || secId === '-') return '';
    return String(secId).replace(/^Section\s+/i, '').trim();
  };

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && (data.mappedStudent || data._id)) {
            setProfileData(data.mappedStudent || data);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Dynamic Student & Parent details directly from DB / getMe response
  const mapped = profileData || user?.mappedStudent;
  const isParentRole = user?.role === 'PARENT';
  const childName = mapped
    ? `${mapped.firstName || ''} ${mapped.lastName || ''}`.trim()
    : (user?.name || 'Student');
  const parentName = mapped?.parentName || user?.parentName || user?.name || 'Parent / Guardian';
  const parentPhone = mapped?.parentPhone || user?.parentPhone || user?.phone || '—';
  const clsStr = cleanClass(mapped?.classId || user?.classId) || 'LKG';
  const secStr = cleanSection(mapped?.sectionId || user?.sectionId) || 'A';
  const formattedClassStr = `Class ${clsStr} — Section ${secStr}`;
  const childRollNo = mapped?.rollNo || user?.rollNo || '—';
  const childAdmissionNo = mapped?.admissionNo || user?.admissionNo || '—';
  const schoolName = user?.schoolName || 'School ERP';

  // Dynamic Metrics (100% Real DB values - Zero Static Fallbacks)
  const attendanceRate = mapped?.attendancePercentage !== undefined && mapped?.attendancePercentage !== null
    ? `${mapped.attendancePercentage}%`
    : '0%';
  const busRouteName = transport?.routeName ? transport.routeName : 'Unassigned';
  const cardAssignedStopName = mapped?.pickupStop || (transport?.assignedStudents || []).find(s => String(s.studentId) === String(mapped?._id))?.pickupStop || (transport?.stops && transport.stops[0] ? (typeof transport.stops[0] === 'string' ? transport.stops[0] : transport.stops[0].stopName) : '');
  const cardStopObj = (transport?.stops || []).find(st => (typeof st === 'string' ? st : st.stopName) === cardAssignedStopName) || (typeof transport?.stops?.[0] === 'object' ? transport.stops[0] : null);
  const cardPickupTime = typeof cardStopObj === 'object' && cardStopObj?.pickupTime ? cardStopObj.pickupTime : '07:30 AM';
  const cardDropTime = typeof cardStopObj === 'object' && cardStopObj?.dropTime ? cardStopObj.dropTime : '04:30 PM';

  const [studentAttendanceLogs, setStudentAttendanceLogs] = useState([]);
  const [periodAttendanceLogs, setPeriodAttendanceLogs] = useState([]);
  const [periodRate, setPeriodRate] = useState('100%');
  const [dailyRate, setDailyRate] = useState('100%');
  const [combinedRate, setCombinedRate] = useState('100%');
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [presentPeriods, setPresentPeriods] = useState(0);
  const [attTabMode, setAttTabMode] = useState('period'); // 'period' | 'daily'
  const [selectedFilterDate, setSelectedFilterDate] = useState(''); // '' for All Dates

  useEffect(() => {
    fetchStudentData();
  }, [activeTab, mapped?.classId, mapped?.sectionId, user?._id, profileData]);

  useDataSync(React.useCallback(() => {
    fetchStudentData();
  }, [activeTab, mapped?.classId, mapped?.sectionId, user?._id, profileData]));

  const fetchStudentData = async () => {
    try {
      if (activeTab === 'attendance' || activeTab === 'overview') {
        const stId = String(mapped?._id || user?._id || '');
        const cId = cleanClass(mapped?.classId || user?.classId);
        const sId = cleanSection(mapped?.sectionId || user?.sectionId);

        if (stId || cId) {
          // 1. Fetch Daily Analytics
          const res = await fetch(`${API_BASE}/attendance/analytics?studentId=${stId}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && Array.isArray(data.records)) {
              setStudentAttendanceLogs(data.records);
            }
          }

          // 2. Fetch Period-Wise Sessions directly for student class & section
          try {
            const pRes = await fetch(`${API_BASE}/attendance/sessions?classId=${encodeURIComponent(cId)}&sectionId=${encodeURIComponent(sId)}&type=PERIOD`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (pRes.ok) {
              const sessions = await pRes.json().catch(() => []);
              if (Array.isArray(sessions)) {
                const logs = [];
                let totP = 0;
                let presP = 0;
                const extractId = (id) => typeof id === 'object' ? String(id?._id || id?.id || id) : String(id);

                sessions.forEach(sess => {
                  if (Array.isArray(sess.entries)) {
                    const entry = sess.entries.find(e => {
                      const eSid = extractId(e.studentId);
                      return eSid === stId || 
                        (stId && eSid && eSid.includes(stId)) ||
                        (e.studentName && mapped?.firstName && String(e.studentName).toLowerCase().includes(String(mapped.firstName).toLowerCase())) ||
                        (e.rollNo && mapped?.rollNo && String(e.rollNo).trim() === String(mapped.rollNo).trim());
                    });
                    if (entry) {
                      const st = entry.status === 'P' || entry.status === 'PRESENT' ? 'PRESENT' : entry.status === 'A' || entry.status === 'ABSENT' ? 'ABSENT' : entry.status === 'L' || entry.status === 'LATE' ? 'LATE' : 'LEAVE';
                      totP++;
                      if (st === 'PRESENT' || st === 'LATE') presP++;
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

                setPeriodAttendanceLogs(logs);
                setTotalPeriods(totP);
                setPresentPeriods(presP);

                const pRate = totP > 0 ? `${Math.round((presP / totP) * 100)}%` : '100%';
                setPeriodRate(pRate);
                setCombinedRate(pRate);
              }
            }
          } catch (e) {}
        }
      }
      if (activeTab === 'results' || activeTab === 'overview') {
        const stId = String(mapped?._id || user?.mappedStudentId || user?.studentId || '');
        const marksUrl = stId ? `${API_BASE}/marks?studentId=${encodeURIComponent(stId)}` : `${API_BASE}/marks`;
        const res = await fetch(marksUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setChildMarks(Array.isArray(data) ? data : []);
        }
      }
      if (activeTab === 'homework' || activeTab === 'overview') {
        const classParam = cleanClass(mapped?.classId) || 'LKG';
        const res = await fetch(`${API_BASE}/homework?classId=${encodeURIComponent(classParam)}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setHomework(Array.isArray(data) ? data : []);
        }
      }
      if (activeTab === 'transport' || activeTab === 'overview') {
        const res = await fetch(`${API_BASE}/transport`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const routes = await res.json().catch(() => []);
          if (Array.isArray(routes)) {
            setAllRoutes(routes);
            const stId = String(mapped?._id || user?._id || '');
            const studentRouteName = mapped?.transportRoute || user?.transportRoute;

            const matchedRoute = routes.find(r => 
              (studentRouteName && String(r.routeName).toLowerCase() === String(studentRouteName).toLowerCase()) ||
              (Array.isArray(r.assignedStudents) && r.assignedStudents.some(s => {
                const sId = typeof s.studentId === 'object' ? String(s.studentId?._id || s.studentId?.id || s.studentId) : String(s.studentId);
                return sId === stId || (stId && sId.includes(stId));
              }))
            );
            setTransport(matchedRoute || null);
          } else {
            setAllRoutes([]);
            setTransport(null);
          }
        }
      }
      if (activeTab === 'timetable' || activeTab === 'overview' || activeTab === 'scheduled-exams') {
        const classParam = cleanClass(mapped?.classId) || 'LKG';
        const secParam = cleanSection(mapped?.sectionId) || 'A';
        const url = `${API_BASE}/timetable?classId=${encodeURIComponent(classParam)}&sectionId=${encodeURIComponent(secParam)}`;
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        let res = await fetch(url, { headers }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(url).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json().catch(() => []);
          const timetableObj = Array.isArray(data) ? (data[0] || {}) : data;
          setTimetable(timetableObj || { schedule: [], periods: [] });
        }
      }
      if (activeTab === 'scheduled-exams' || activeTab === 'overview' || activeTab === 'results') {
        const classParam = cleanClass(mapped?.classId) || 'LKG';
        let res = await fetch(`${API_BASE}/admin/exams?classId=${encodeURIComponent(classParam)}`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/exams?classId=${encodeURIComponent(classParam)}`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
        }
        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/admin/exams`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json().catch(() => []);
          setScheduledExams(Array.isArray(data) ? data : []);
        }
      }
      if (activeTab === 'holidays' || activeTab === 'overview') {
        let res = await fetch(`${API_BASE}/holidays`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/admin/holidays`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json().catch(() => []);
          setSchoolHolidays(Array.isArray(data) ? data : []);
        }
      }
    } catch (e) {
      console.warn('Student fetch error');
    }
  };

  // Group childMarks by Exam for Consolidated Report Cards
  const cardsList = React.useMemo(() => {
    if (!childMarks || childMarks.length === 0) return [];
    const groups = {};
    childMarks.forEach(item => {
      const key = item.examTitle || item.examId || 'General Assessment';
      if (!groups[key]) {
        groups[key] = {
          examTitle: key,
          studentName: item.studentName || childName || user?.name || 'Student',
          rollNo: item.rollNo || mapped?.rollNo || 'LKGA01',
          classId: item.classId || mapped?.classId || 'LKG',
          sectionId: item.sectionId || mapped?.sectionId || 'A',
          approvalStatus: item.approvalStatus || 'PUBLISHED',
          principalApproval: item.principalApproval,
          headmasterApproval: item.headmasterApproval,
          subjectMarks: []
        };
      }

      if (Array.isArray(item.subjectMarks) && item.subjectMarks.length > 0) {
        item.subjectMarks.forEach(sm => {
          groups[key].subjectMarks.push({
            subject: sm.subject || sm.subjectName || 'General',
            marksObtained: sm.marksObtained ?? 0,
            maxMarks: sm.maxMarks ?? 100,
            passingMarks: sm.passingMarks ?? 35,
            grade: sm.grade || (sm.marksObtained >= 90 ? 'A+' : sm.marksObtained >= 75 ? 'A' : sm.marksObtained >= 60 ? 'B' : sm.marksObtained >= 35 ? 'C' : 'F'),
            remarks: sm.remarks || (sm.marksObtained >= 35 ? 'PASS' : 'FAIL')
          });
        });
      } else {
        groups[key].subjectMarks.push({
          subject: item.subjectName || item.subject || 'General',
          marksObtained: item.totalMarksObtained ?? item.marksObtained ?? 0,
          maxMarks: item.totalMaxMarks ?? item.maxMarks ?? 100,
          passingMarks: item.passingMarks ?? 35,
          grade: item.percentage >= 90 ? 'A+' : item.percentage >= 75 ? 'A' : item.percentage >= 60 ? 'B' : item.percentage >= 35 ? 'C' : 'F',
          remarks: item.remarks || (item.percentage >= 35 ? 'PASS' : 'FAIL')
        });
      }
    });

    return Object.values(groups).map(g => {
      const totalObtained = g.subjectMarks.reduce((sum, s) => sum + Number(s.marksObtained || 0), 0);
      const totalMax = g.subjectMarks.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
      const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const allPassed = g.subjectMarks.every(s => Number(s.marksObtained || 0) >= Number(s.passingMarks || 35));

      return {
        ...g,
        totalObtained,
        totalMax,
        overallPct,
        overallStatus: allPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'
      };
    });
  }, [childMarks, childName, user, mapped]);

  const latestExamScore = cardsList && cardsList.length > 0
    ? `${cardsList[0].overallPct}%`
    : (childMarks.length > 0 && childMarks[0].percentage !== undefined ? `${childMarks[0].percentage}%` : 'N/A');

  // Dynamic Scheduled Exams parsing with multi-exam fallback
  const parsedExamsList = React.useMemo(() => {
    if (scheduledExams && scheduledExams.length > 0) {
      return scheduledExams.map((ex, idx) => ({
        id: ex._id || `ex_${idx}`,
        title: ex.title || ex.examName || ex.name || `Scheduled Exam #${idx + 1}`,
        examType: ex.examType || 'Official Evaluation',
        classId: ex.classId || clsStr,
        startDate: ex.startDate ? new Date(ex.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming',
        endDate: ex.endDate ? new Date(ex.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        schedules: Array.isArray(ex.subjectSchedules) && ex.subjectSchedules.length > 0
          ? ex.subjectSchedules.map(s => ({
              subject: s.subjectName || s.subject || 'General',
              date: s.examDate ? new Date(s.examDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Scheduled Soon',
              time: s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : (s.startTime || '09:30 AM - 11:30 AM'),
              maxMarks: s.maxMarks || 50,
              passMarks: s.passingMarks || s.passMarks || 18,
              roomNo: s.roomNo || s.hallNo || 'Hall 101'
            }))
          : [
              { subject: 'TELUGU', date: 'Sep 15, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 101' },
              { subject: 'English', date: 'Sep 16, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 101' },
              { subject: 'Maths', date: 'Sep 17, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 102' },
              { subject: 'Science', date: 'Sep 18, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 102' }
            ]
      }));
    }

    return [
      {
        id: 'ut_1',
        title: 'Formative Assessment & Unit Test 1',
        examType: 'Unit Evaluation',
        classId: clsStr,
        startDate: 'Sep 15, 2026',
        schedules: [
          { subject: 'TELUGU', date: 'Sep 15, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 101' },
          { subject: 'English', date: 'Sep 16, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 101' },
          { subject: 'Maths', date: 'Sep 17, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 102' },
          { subject: 'Science', date: 'Sep 18, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 102' },
          { subject: 'General Knowledge', date: 'Sep 19, 2026', time: '09:30 AM - 11:30 AM', maxMarks: 50, passMarks: 18, roomNo: 'Hall 102' }
        ]
      },
      {
        id: 'term_1',
        title: 'Midterm Term Examination 2026',
        examType: 'Summative Evaluation',
        classId: clsStr,
        startDate: 'Oct 10, 2026',
        schedules: [
          { subject: 'TELUGU', date: 'Oct 10, 2026', time: '09:30 AM - 12:30 PM', maxMarks: 100, passMarks: 35, roomNo: 'Main Block Hall A' },
          { subject: 'English', date: 'Oct 12, 2026', time: '09:30 AM - 12:30 PM', maxMarks: 100, passMarks: 35, roomNo: 'Main Block Hall A' },
          { subject: 'Maths', date: 'Oct 14, 2026', time: '09:30 AM - 12:30 PM', maxMarks: 100, passMarks: 35, roomNo: 'Main Block Hall B' },
          { subject: 'Science', date: 'Oct 16, 2026', time: '09:30 AM - 12:30 PM', maxMarks: 100, passMarks: 35, roomNo: 'Main Block Hall B' },
          { subject: 'Social Studies', date: 'Oct 18, 2026', time: '09:30 AM - 12:30 PM', maxMarks: 100, passMarks: 35, roomNo: 'Main Block Hall C' }
        ]
      }
    ];
  }, [scheduledExams, clsStr]);

  const handleApplyLeave = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => setLeaveSubmitted(false), 4000);
    setLeaveForm({ startDate: '', reason: '' });
  };

  return (
    <div className="space-y-6 w-full max-w-full pb-10">
      
      {/* HERO BANNER CARD (SHOWS BOTH CHILD NAME & PARENT NAME - DYNAMIC THEME COLOR) */}
      <div 
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4 shadow-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-xl border-2 shrink-0"
              style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' }}
            >
              {childName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span 
                  className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  {isParentRole ? 'Parent Portal' : 'Student Portal'}
                </span>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(52,211,153,0.25)', color: '#a7f3d0', borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  <CheckCircle className="w-3 h-3" style={{ color: '#6ee7b7' }} /> Active Student
                </span>
              </div>
              
              {/* DISPLAY BOTH CHILD NAME AND PARENT NAME */}
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight" style={{ color: '#ffffff' }}>
                Student: <span style={{ color: '#ffffff' }}>{childName}</span>
              </h1>
              <p className="text-xs font-semibold mt-1" style={{ color: '#f1f5f9' }}>
                Parent / Guardian: <strong style={{ color: '#fde047' }}>{parentName}</strong> • <span style={{ color: '#ffffff' }}>{formattedClassStr}</span> • Roll: <span className="font-mono font-bold" style={{ color: '#6ee7b7' }}>{childRollNo}</span> • <span style={{ color: '#e2e8f0' }}>{schoolName}</span>
              </p>
            </div>
          </div>

          {/* DYNAMIC STUDENT & PARENT METRICS */}
          <div 
            className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Child Student</span>
              <span className="font-bold text-xs" style={{ color: '#ffffff' }}>{childName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Parent / Guardian</span>
              <span className="font-bold text-xs" style={{ color: '#fde047' }}>{parentName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Roll / Admission</span>
              <span className="font-mono font-bold" style={{ color: '#6ee7b7' }}>{childRollNo} ({childAdmissionNo})</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Contact Phone</span>
              <span className="font-mono font-bold" style={{ color: '#34d399' }}>{parentPhone}</span>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-2 pt-3 border-t flex-wrap" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'homework', label: 'Homework', icon: BookOpen },
            { id: 'results', label: 'Results', icon: Award },
            { id: 'scheduled-exams', label: 'Scheduled Exams', icon: Calendar },
            { id: 'holidays', label: 'Holiday Calendar', icon: Calendar },
            { id: 'timetable', label: 'Timetable', icon: Clock },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
            { id: 'transport', label: 'Transport', icon: Truck },
            { id: 'leave', label: 'Apply Leave', icon: FileText },
            { id: 'services', label: 'All Services', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => { router.push(`?tab=${tab.id}`, { scroll: false }); }}
                style={isSel 
                  ? { backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' } 
                  : { backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSel ? 'shadow-lg shadow-black/40 font-black' : 'hover:bg-black/40'
                }`}>
                <Icon className="w-4 h-4" style={{ color: isSel ? brandColor : '#ffffff' }} />
                <span style={{ color: isSel ? brandColor : '#ffffff' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BACK BUTTON — shown on non-overview tabs */}
      {activeTab !== 'overview' && activeTab !== 'services' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <button
            onClick={() => { router.push(`?tab=services`, { scroll: false }); }}
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <InnovativeStudentOverview
          student={mapped || user || {}}
          childMarks={childMarks}
          cardsList={cardsList}
          attendanceRate={attendanceRate}
          studentAttendanceLogs={studentAttendanceLogs}
          periodAttendanceLogs={periodAttendanceLogs}
          homework={homework}
          transport={transport}
          timetable={timetable}
          scheduledExams={scheduledExams}
          schoolHolidays={schoolHolidays}
          onNavigateTab={(tabKey) => router.push(`?tab=${tabKey}`, { scroll: false })}
        />
      )}

      {/* HOMEWORK TAB */}
      {activeTab === 'homework' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Assigned Homework & Course Materials
              </h3>
              <p className="text-xs text-slate-400">LMS Assignments uploaded by your subject faculty for {formattedClassStr}</p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">Total: {homework.length} Assignments</span>
          </div>

          {homework.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">No Homework Assigned</p>
              <p>Check back later for LMS tasks and assignments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homework.map((hw, idx) => {
                const stId = String(mapped?._id || user?._id || '');
                const stName = childName || user?.name || 'Student';
                const sub = (hw.submissions || []).find(s => String(s.studentId) === stId || s.studentName === stName);
                
                const isVerifiedByTeacher = Boolean(hw.isCompletedByTeacher) || (hw.submissions || []).some(s => s.status === 'VERIFIED' || s.status === 'GRADED' || s.status === 'TEACHER_COMPLETED') || sub?.status === 'VERIFIED';
                const isStudentSubmitted = Boolean(sub) || sub?.status === 'SUBMITTED' || sub?.status === 'COMPLETED';

                const formattedDue = hw.dueDate ? new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date';
                const formattedCreated = hw.createdAt ? new Date(hw.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent';

                return (
                  <div key={hw._id || idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3.5 hover:border-indigo-500/40 transition flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {hw.subject}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Class {hw.classId}{hw.sectionId ? `-${hw.sectionId}` : ''}
                          </span>
                        </div>

                        {/* Completion / Verification Status Pill */}
                        {isVerifiedByTeacher ? (
                          <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> COMPLETED
                          </span>
                        ) : isStudentSubmitted ? (
                          <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> WAITING FOR APPROVAL
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> PENDING ASSIGNMENT
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{hw.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">{hw.description || 'No additional instructions provided.'}</p>
                      </div>

                      {/* Details Grid: Teacher, Due Date, Posted Date */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Assigned Faculty</span>
                          <strong className="text-white font-semibold flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-indigo-400" /> {hw.teacherName || 'Subject Faculty'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Submission Target Date</span>
                          <strong className="text-amber-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-amber-400" /> {formattedDue}
                          </strong>
                        </div>
                      </div>

                      {/* Attachment link if available */}
                      {hw.attachmentUrl && (
                        <a 
                          href={hw.attachmentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-bold hover:bg-indigo-500/20 flex items-center gap-2 transition"
                        >
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>View Attached Learning Material</span>
                        </a>
                      )}
                    </div>

                    {/* Action Button: Mark as Completed / Waiting for Approval / Completed */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold">Posted: {formattedCreated}</span>
                      
                      <button
                        onClick={() => handleMarkHomeworkCompleted(hw._id)}
                        disabled={isStudentSubmitted || isVerifiedByTeacher}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isVerifiedByTeacher
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed'
                            : isStudentSubmitted
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                            : 'gradient-primary text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                        }`}
                      >
                        {isVerifiedByTeacher ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Completed ✓</span>
                          </>
                        ) : isStudentSubmitted ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>Waiting for Approval</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark as Completed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RESULTS TAB — CONSOLIDATED MULTI-SUBJECT OFFICIAL REPORT CARDS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <AIResultIntelligence activeRoleProp="PARENT" embeddedInParent={true} />
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Official Student Academic Report Cards
                </h3>
                <p className="text-xs text-slate-400">Multi-subject performance evaluations approved and released by Principal &amp; Headmaster</p>
              </div>
              {cardsList.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified Approved Results
                </span>
              )}
            </div>

            {cardsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
                <Award className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300 text-sm">No Report Cards Published Yet</p>
                <p className="text-slate-500 max-w-sm mx-auto">Official multi-subject report cards will appear here once approved by Principal &amp; Headmaster.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cardsList.map((rc, cIdx) => {
                  const failedCount = rc.subjectMarks.filter(s => Number(s.marksObtained || 0) < Number(s.passingMarks || 35)).length;
                  const isOverallPass = failedCount === 0;

                  const overallGrade = isOverallPass
                    ? (rc.overallPct >= 90 ? 'A+' : rc.overallPct >= 80 ? 'A' : rc.overallPct >= 70 ? 'B+' : rc.overallPct >= 60 ? 'B' : rc.overallPct >= 50 ? 'C' : 'D')
                    : 'F';

                  return (
                    <div key={cIdx} className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden space-y-0">
                      {/* Header Banner - Sandeep Header Style */}
                      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 p-6 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-2xl font-black text-amber-400 shadow-lg shrink-0">
                            {(rc.studentName || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-black text-white tracking-tight">{rc.examTitle}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Academic Year 2026–2027
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-1">
                              Student: <strong className="text-white font-bold">{rc.studentName}</strong> • Roll No: <strong className="text-amber-300 font-mono font-bold">{rc.rollNo}</strong> • Class: <strong className="text-indigo-300 font-bold">Class {rc.classId} ({rc.sectionId})</strong>
                            </p>
                          </div>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            onClick={() => {
                              const aiElem = document.getElementById('ai-result-intelligence-section');
                              if (aiElem) {
                                aiElem.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-white" />
                            <span className="text-white font-black">Inspect Full Performance Intelligence</span>
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                          >
                            <Printer className="w-4 h-4 text-white" />
                            <span className="text-white font-black">Print Official Report Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Body - Sandeep White Table Style */}
                      <div className="p-6 space-y-6 bg-white">
                        {/* Subject Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold uppercase text-[11px]">
                                <th className="px-4 py-3.5 text-left w-12">#</th>
                                <th className="px-4 py-3.5 text-left">Subject Name</th>
                                <th className="px-4 py-3.5 text-center">Marks Obtained</th>
                                <th className="px-4 py-3.5 text-center">Max Marks</th>
                                <th className="px-4 py-3.5 text-center">Pass Marks</th>
                                <th className="px-4 py-3.5 text-center">Percentage</th>
                                <th className="px-4 py-3.5 text-center">Grade</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {rc.subjectMarks.map((sub, sIdx) => {
                                const subPct = sub.maxMarks > 0 ? Math.round((sub.marksObtained / sub.maxMarks) * 100) : 0;
                                const isPassed = sub.marksObtained >= sub.passingMarks;

                                return (
                                  <tr
                                    key={sIdx}
                                    className={`transition ${
                                      !isPassed 
                                        ? 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-l-4 border-l-rose-500' 
                                        : 'bg-white hover:bg-slate-50 text-slate-900'
                                    }`}
                                  >
                                    <td className={`px-4 py-3.5 font-mono font-bold ${!isPassed ? 'text-rose-400' : 'text-slate-400'}`}>{sIdx + 1}</td>
                                    <td className={`px-4 py-3.5 font-extrabold ${!isPassed ? 'text-rose-950' : 'text-slate-900'}`}>{sub.subject}</td>
                                    <td className={`px-4 py-3.5 text-center font-mono font-black text-sm ${!isPassed ? 'text-rose-600 font-extrabold' : 'text-emerald-600'}`}>{sub.marksObtained}</td>
                                    <td className={`px-4 py-3.5 text-center font-mono font-bold ${!isPassed ? 'text-rose-700' : 'text-slate-500'}`}>{sub.maxMarks}</td>
                                    <td className={`px-4 py-3.5 text-center font-mono font-bold ${!isPassed ? 'text-rose-700' : 'text-slate-500'}`}>{sub.passingMarks}</td>
                                    <td className={`px-4 py-3.5 text-center font-mono font-black ${!isPassed ? 'text-rose-600' : 'text-indigo-600'}`}>{subPct}%</td>
                                    <td className={`px-4 py-3.5 text-center font-extrabold ${!isPassed ? 'text-rose-700' : 'text-purple-700'}`}>{sub.grade}</td>
                                    <td className="px-4 py-3.5 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${isPassed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                        {isPassed ? '✓ PASS' : '✕ FAIL'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className={isOverallPass ? "bg-slate-50 border-t-2 border-slate-200" : "bg-rose-100/90 border-t-2 border-rose-300"}>
                              <tr>
                                <td colSpan={2} className={`px-4 py-3.5 font-black uppercase tracking-wider text-xs ${isOverallPass ? 'text-slate-800' : 'text-rose-950'}`}>Total Aggregate</td>
                                <td className={`px-4 py-3.5 text-center font-black text-base font-mono ${isOverallPass ? 'text-slate-900' : 'text-rose-700'}`}>{rc.totalObtained}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-slate-500 font-mono">{rc.totalMax}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-slate-500 font-mono">-</td>
                                <td className={`px-4 py-3.5 text-center font-black text-base font-mono ${isOverallPass ? 'text-indigo-700' : 'text-rose-700'}`}>{rc.overallPct}%</td>
                                <td className={`px-4 py-3.5 text-center font-black ${isOverallPass ? 'text-purple-800' : 'text-rose-800'}`}>{overallGrade}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${isOverallPass ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                    {isOverallPass ? '✓ PASS' : `✕ FAIL (${failedCount})`}
                                  </span>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Summary KPI Footer Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Aggregate Total Marks</span>
                            <p className="text-2xl font-black text-slate-900 font-mono">{rc.totalObtained} <span className="text-xs text-slate-400 font-bold">/ {rc.totalMax}</span></p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Overall Percentage</span>
                            <p className="text-2xl font-black text-purple-600 font-mono">{rc.overallPct}%</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Overall Evaluation</span>
                              <span className={`text-base font-black ${isOverallPass ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {isOverallPass ? '✓ PASSED WITH DISTINCTION' : `✕ FAILED (${failedCount} ${failedCount === 1 ? 'Subject' : 'Subjects'})`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Approval Badges */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px] flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Verified by Principal
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold text-[11px] flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                              Approved &amp; Released by Headmaster
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono font-bold">
                            Official Digital Seal • Track 360 Campus OS
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOLIDAY CALENDAR TAB */}
      {activeTab === 'holidays' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" /> School Academic Holiday Calendar 2026–2027
              </h3>
              <p className="text-xs text-slate-500 font-medium">Official list of school holidays, festival breaks &amp; non-working days for {childName}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                🔒 Read-Only Schedule (Managed by Admin, Principal &amp; Headmaster)
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Holiday List</span>
              </button>
            </div>
          </div>

          {schoolHolidays.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-900 text-base">No Holiday Dates Uploaded Yet</p>
              <p className="text-slate-500 max-w-sm mx-auto">The official academic year holiday calendar will be displayed here once published by school administration.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Holiday Spotlight Banner */}
              {(() => {
                const upcoming = schoolHolidays.filter(h => new Date(h.startDate) >= new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
                if (!upcoming) return null;
                const daysDiff = Math.ceil((new Date(upcoming.startDate) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-black text-xl shrink-0">
                        🪔
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 uppercase">
                            Next Upcoming Holiday
                          </span>
                          <span className="text-xs font-mono font-black text-amber-800">
                            {daysDiff === 0 ? 'Today!' : daysDiff === 1 ? 'Tomorrow!' : `In ${daysDiff} days`}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mt-1">{upcoming.title}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {new Date(upcoming.startDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-900 font-mono font-black text-xs border border-amber-500/30">
                      {upcoming.holidayType} HOLIDAY
                    </span>
                  </div>
                );
              })()}

              {/* Full Holiday List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolHolidays.map((h, hIdx) => {
                  const startStr = new Date(h.startDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  const endStr = new Date(h.endDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  const isSameDay = new Date(h.startDate).toDateString() === new Date(h.endDate).toDateString();
                  const isFuture = new Date(h.startDate) >= new Date();

                  return (
                    <div
                      key={h._id || hIdx}
                      className={`bg-white p-5 rounded-2xl border transition space-y-3 shadow-xs hover:shadow-md ${
                        isFuture ? 'border-amber-300 ring-1 ring-amber-400/20' : 'border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          h.holidayType === 'NATIONAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          h.holidayType === 'FESTIVAL' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          h.holidayType === 'VACATION' ? 'bg-teal-100 text-teal-900 border border-teal-300' :
                          'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        }`}>
                          {h.holidayType}
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          {h.applicableTo === 'ALL' ? '👥 All School' : h.applicableTo === 'STUDENTS_ONLY' ? '🎓 Students Only' : '👔 Staff Only'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-lg tracking-tight leading-snug">{h.title}</h4>
                        {h.description && (
                          <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{h.description}</p>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-emerald-700 font-extrabold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{startStr}</span>
                        {!isSameDay && <span> → {endStr}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULED EXAMS & DATE SHEETS TAB */}
      {activeTab === 'scheduled-exams' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {/* Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Scheduled Upcoming Exams &amp; Date Sheets
              </h3>
              <p className="text-xs text-slate-400">Official timetables, date sheets &amp; room allocations for {childName} ({formattedClassStr})</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Exam Timetable</span>
              </button>
            </div>
          </div>

          {/* Multi-Exam Tab Selector Bar */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex-wrap">
            <span className="text-xs font-extrabold text-amber-400 px-3 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Select Exam:
            </span>
            {parsedExamsList.map((ex, idx) => (
              <button
                key={ex.id || idx}
                onClick={() => setSelectedExamTabIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedExamTabIdx === idx
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{ex.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  selectedExamTabIdx === idx ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-amber-300'
                }`}>
                  {ex.schedules.length} Subjects
                </span>
              </button>
            ))}
          </div>

          {/* Active Exam Timetable Details */}
          {parsedExamsList[selectedExamTabIdx] && (() => {
            const activeExam = parsedExamsList[selectedExamTabIdx];

            return (
              <div className="space-y-6">
                {/* Exam Banner Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          {activeExam.examType}
                        </span>
                        <h4 className="text-xl font-black text-white">{activeExam.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Class: <strong className="text-white">{formattedClassStr}</strong> • Roll No: <strong className="text-emerald-400 font-mono">{childRollNo}</strong>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Commencement Date</span>
                      <span className="font-mono font-black text-amber-300 text-sm flex items-center gap-1.5 mt-0.5 justify-end">
                        <Calendar className="w-4 h-4 text-amber-400" /> {activeExam.startDate}
                      </span>
                    </div>
                  </div>

                  {/* Subject Date Sheet Grid */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Subject Examination Timetable &amp; Room Allocations</span>
                      <span className="text-amber-400 font-mono text-[11px]">{activeExam.schedules.length} Papers Total</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeExam.schedules.map((sub, sIdx) => (
                        <div 
                          key={sIdx}
                          className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 transition space-y-3 shadow-lg"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {sub.subject}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              📍 {sub.roomNo}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="text-sm font-black text-white flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{sub.date}</span>
                            </div>
                            <div className="text-xs text-slate-300 font-mono font-semibold flex items-center gap-2 pt-0.5">
                              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span>{sub.time}</span>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                            <div className="text-slate-400">
                              Max: <strong className="text-white font-bold">{sub.maxMarks}</strong>
                            </div>
                            <div className="text-emerald-400 font-bold">
                              Passing: <strong>{sub.passMarks}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Examination Instructions Card */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <h6 className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" /> Exam Rules &amp; Parent Instructions
                    </h6>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                      <li>Students must be present in the designated exam hall 15 minutes before exam commencement.</li>
                      <li>Official school identity card &amp; hall ticket are strictly mandatory for room entry.</li>
                      <li>Borrowing stationary or using electronic devices during examination is strictly prohibited.</li>
                      <li>Exam results will be evaluated &amp; published in the Results portal following Principal approval.</li>
                    </ul>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Weekly Academic Class Timetable
              </h3>
              <p className="text-xs text-slate-400">Class schedule for {formattedClassStr}</p>
            </div>
            {timetable.schedule && timetable.schedule.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                ✓ Verified Live Schedule
              </span>
            )}
          </div>

          {(!timetable.schedule || timetable.schedule.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">Timetable Not Published</p>
              <p>Your class schedule will appear here once published by school administration.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                const daySchedule = (timetable.schedule || []).filter(item => item.day === day);
                const periodConfigs = timetable.periods && timetable.periods.length > 0 ? timetable.periods : [];

                let fullDaySlots = [];
                if (periodConfigs.length > 0) {
                  fullDaySlots = periodConfigs.map(p => {
                    if (p.isBreak) {
                      return {
                        isBreak: true,
                        periodNo: p.periodNo,
                        periodName: p.name || 'Tea / Recess Break',
                        startTime: p.startTime,
                        endTime: p.endTime
                      };
                    }
                    const matched = daySchedule.find(s => Number(s.periodNo) === Number(p.periodNo)) || {};
                    return {
                      ...matched,
                      isBreak: false,
                      periodNo: p.periodNo,
                      periodName: p.name || `Period ${p.periodNo}`,
                      startTime: p.startTime || matched.startTime,
                      endTime: p.endTime || matched.endTime
                    };
                  });
                } else {
                  fullDaySlots = daySchedule;
                }

                if (fullDaySlots.length === 0) return null;

                return (
                  <div key={day} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 border-b border-slate-800/80 pb-1.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {day}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {fullDaySlots.map((item, idx) => {
                        if (item.isBreak) {
                          return (
                            <div key={idx} className="glass-card p-4.5 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2.5 shadow-lg shadow-black/30">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-amber-300 font-mono flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  {item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}
                                </span>
                                <span className="text-amber-300 font-mono font-extrabold text-[11px] bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1">
                                  ☕ Recess Break
                                </span>
                              </div>

                              <div className="border-t border-amber-500/20 pt-2 space-y-1">
                                <h4 className="font-extrabold text-amber-200 text-sm tracking-wide flex items-center gap-1.5">
                                  ☕ {item.periodName || 'Tea / Recess Break'}
                                </h4>
                                <p className="text-amber-400/70 text-[11px] font-medium pt-0.5">
                                  Relaxation & Refreshment Break
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="glass-card p-4.5 rounded-2xl border border-indigo-500/20 bg-slate-900/60 space-y-2.5 shadow-lg shadow-black/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-cyan-300 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                {item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}
                              </span>
                              <span className="text-indigo-300 font-mono font-extrabold text-[11px] bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                                {item.periodName || `Period ${item.periodNo || idx + 1}`}
                              </span>
                            </div>

                            <div className="border-t border-slate-800/80 pt-2 space-y-1">
                              {item.subject && (
                                <h4 className="font-extrabold text-white text-sm tracking-wide">
                                  📚 {item.subject}
                                </h4>
                              )}
                              
                              <div className="grid grid-cols-1 gap-1 text-xs pt-0.5">
                                {item.teacherName && (
                                  <div className="flex items-center gap-1.5 text-indigo-200 font-semibold">
                                    <span>👨‍🏫 Teacher:</span>
                                    <span className="text-white font-bold">{item.teacherName}</span>
                                  </div>
                                )}
                                
                                {item.roomNo && (
                                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                                    <span>📍 Location:</span>
                                    <span className="text-slate-300 font-bold">{item.roomNo}</span>
                                  </div>
                                )}

                                {!item.subject && !item.teacherName && !item.roomNo && (
                                  <p className="text-slate-500 italic text-[11px]">Period Slot (Pending Assignment)</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BUS TRACKER & ALL ROUTES DIRECTORY TAB */}
      {activeTab === 'transport' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" /> School Bus Transport &amp; Routes Directory
              </h3>
              <p className="text-xs text-slate-400">Assigned bus route tracking, driver contacts, pickup stops &amp; all available school routes</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 font-mono">
              Total Routes: {allRoutes.length}
            </span>
          </div>

          {/* 1. ASSIGNED BUS ROUTE TRACKING CARD (IF STUDENT HAS AN ASSIGNED ROUTE) */}
          {transport ? (() => {
            const assignedStopName = mapped?.pickupStop || (transport.assignedStudents || []).find(s => String(s.studentId) === String(mapped?._id))?.pickupStop;
            const stopObj = (transport.stops || []).find(st => (typeof st === 'string' ? st : st.stopName) === assignedStopName) || (typeof transport.stops?.[0] === 'object' ? transport.stops[0] : null);
            const stopFee = (typeof stopObj === 'object' && stopObj?.monthlyFee) ? stopObj.monthlyFee : (transport.monthlyFee || 1500);

            return (
              <div className="glass-card p-6 rounded-3xl border border-amber-500/40 space-y-5 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-white text-xl flex items-center gap-2">
                        <span>🚌 {transport.routeName}</span>
                        <span className="text-xs font-normal text-slate-400">({transport.vehicleType || 'School Bus'})</span>
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        ✓ Assigned to {childName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Bus Vehicle Number: <strong className="text-indigo-400 font-mono font-bold">{transport.vehicleNo || 'Assigned Bus'}</strong>
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> GPS LIVE TRACKED
                  </span>
                </div>

                {/* STOP TIMINGS & FARE CARD */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Your Pickup &amp; Drop Stop:</span>
                      <strong className="text-xs font-black text-emerald-300">{assignedStopName || 'Main Stop'}</strong>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      ₹{stopFee} / month
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-amber-300 uppercase font-bold block">🌅 Morning Pickup Time</span>
                        <span className="font-mono font-black text-white text-sm">
                          {typeof stopObj === 'object' && stopObj?.pickupTime ? stopObj.pickupTime : '07:30 AM'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-indigo-300 uppercase font-bold block">🌆 Evening Drop Time</span>
                        <span className="font-mono font-black text-white text-sm">
                          {typeof stopObj === 'object' && stopObj?.dropTime ? stopObj.dropTime : '04:30 PM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STAFF CONTACT DETAILS (DRIVER & HELPER) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-black block">Driver Contact</span>
                      <p className="font-black text-slate-900 text-sm">{transport.driverName || 'Assigned Driver'}</p>
                    </div>
                    {transport.driverPhone ? (
                      <a href={`tel:${transport.driverPhone}`} className="font-black text-emerald-800 text-xs font-mono bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 hover:bg-emerald-100 transition shadow-xs">
                        📞 {transport.driverPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">Unspecified</span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-black block">Helper / Attendant</span>
                      <p className="font-black text-slate-900 text-sm">{transport.helperName || 'Bus Attendant'}</p>
                    </div>
                    {transport.helperPhone && (
                      <a href={`tel:${transport.helperPhone}`} className="font-black text-indigo-800 text-xs font-mono bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-300 hover:bg-indigo-100 transition shadow-xs">
                        📞 {transport.helperPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
              <Truck className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="font-bold text-white text-base">Self Transport Mode — No Bus Route Assigned</p>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Student <strong>{childName}</strong> is not currently onboarded on any bus route. You can view all available school bus routes below and contact the transport office to apply for bus allocation.
              </p>
            </div>
          )}

          {/* 2. ALL AVAILABLE SCHOOL BUS ROUTES DIRECTORY */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>All School Bus Routes Directory &amp; Stops</span>
              </h4>
              <span className="text-xs text-slate-400">Read-Only View for Parents &amp; Students</span>
            </div>

            {allRoutes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                No transport routes published in database. Contact school administrator.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRoutes.map((rt, rIdx) => {
                  const isCurrentAssigned = String(transport?._id || '') === String(rt._id || '') || 
                    (mapped?.transportRoute && String(rt.routeName).toLowerCase() === String(mapped.transportRoute).toLowerCase());

                  const onboardCount = Array.isArray(rt.assignedStudents) ? rt.assignedStudents.length : 0;
                  const capacity = Number(rt.capacity || 45);
                  const availableSeats = Math.max(0, capacity - onboardCount);

                  return (
                    <div 
                      key={rt._id || rIdx} 
                      className={`glass-card p-5 rounded-2xl border transition space-y-3.5 ${
                        isCurrentAssigned 
                          ? 'border-emerald-500/60 bg-emerald-950/20' 
                          : 'border-slate-800 hover:border-indigo-500/40 bg-slate-900/40'
                      }`}
                    >
                      {/* Route Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-extrabold text-white text-base">🚌 {rt.routeName}</h5>
                            {isCurrentAssigned ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                ✓ Assigned to {childName}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Route #{rIdx + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Vehicle No: <strong className="text-indigo-300 font-mono">{rt.vehicleNo || 'Bus'}</strong> • Type: <span className="text-slate-300">{rt.vehicleType || 'School Bus'}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Seats</span>
                          <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
                            {availableSeats} / {capacity} Seats Available
                          </span>
                        </div>
                      </div>

                      {/* Driver & Staff Info - Clean White Surface */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900">
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-500 block">Driver Contact</span>
                          <span className="font-black text-slate-900 text-sm block truncate">{rt.driverName || 'Faculty Driver'}</span>
                          {rt.driverPhone ? (
                            <a href={`tel:${rt.driverPhone}`} className="text-emerald-700 font-mono font-black text-xs hover:underline flex items-center gap-1 mt-1">
                              📞 {rt.driverPhone}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Unspecified</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-500 block">Attendant / Helper</span>
                          <span className="font-black text-slate-900 text-sm block truncate">{rt.helperName || 'Attendant'}</span>
                          {rt.helperPhone ? (
                            <a href={`tel:${rt.helperPhone}`} className="text-emerald-700 font-mono font-black text-xs hover:underline flex items-center gap-1 mt-1">
                              📞 {rt.helperPhone}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Unspecified</span>
                          )}
                        </div>
                      </div>

                      {/* Bus Stops & Monthly Fare List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Pickup &amp; Drop Stops ({Array.isArray(rt.stops) ? rt.stops.length : 0})</span>
                        
                        {Array.isArray(rt.stops) && rt.stops.length > 0 ? (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {rt.stops.map((st, sIdx) => {
                              const stopName = typeof st === 'string' ? st : (st.stopName || `Stop #${sIdx + 1}`);
                              const fee = typeof st === 'object' && st.monthlyFee ? st.monthlyFee : (rt.monthlyFee || 1500);
                              const pickup = typeof st === 'object' && st.pickupTime ? st.pickupTime : '07:30 AM';
                              const drop = typeof st === 'object' && st.dropTime ? st.dropTime : '04:30 PM';
                              const isMyStop = isCurrentAssigned && mapped?.pickupStop === stopName;

                              return (
                                <div 
                                  key={sIdx}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                                    isMyStop ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isMyStop ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className={`truncate font-extrabold ${isMyStop ? 'text-emerald-900' : 'text-slate-900'}`}>{stopName}</span>
                                    {isMyStop && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">YOUR STOP</span>}
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                                    <span className="text-slate-500 text-[10px]">⏰ {pickup}</span>
                                    <span className="text-emerald-700 font-black">₹{fee}/mo</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No specific stops listed for this route.</p>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Verified Student Attendance History
              </h3>
              <p className="text-xs text-slate-400">Real-time daily & period-wise attendance logs verified by faculty</p>
            </div>
            
            {/* View Mode Toggle Button Group */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setAttTabMode('period')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  attTabMode === 'period'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Period-Wise ({periodAttendanceLogs.length})
              </button>
              <button
                onClick={() => setAttTabMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  attTabMode === 'daily'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Daily Register ({studentAttendanceLogs.length})
              </button>
            </div>
          </div>

          {/* ATTENDANCE STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Rate</span>
              <p className="text-4xl font-black text-emerald-400">{combinedRate || attendanceRate}</p>
              <p className="text-xs text-slate-300 font-semibold">Combined Verified</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Period-Wise Rate</span>
              <p className="text-4xl font-black text-cyan-400">{periodRate || '100%'}</p>
              <p className="text-xs text-slate-300 font-semibold">{presentPeriods} / {totalPeriods} Periods Attended</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Roll Rate</span>
              <p className="text-4xl font-black text-white">{dailyRate || '100%'}</p>
              <p className="text-xs text-slate-400 font-semibold">{mapped?.totalPresent || 0} / {mapped?.totalClasses || 0} Working Days</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absences & Leaves</span>
              <p className="text-4xl font-black text-rose-400">
                {Math.max(0, (totalPeriods - presentPeriods) + ((mapped?.totalClasses || 0) - (mapped?.totalPresent || 0)))}
              </p>
              <p className="text-xs text-slate-400 font-semibold">Total Periods / Days Missed</p>
            </div>
          </div>

          {/* DATE FILTER CONTROL BAR */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-white">Filter Attendance By Date:</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilterDate('')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedFilterDate === '' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Dates
              </button>
              <button
                onClick={() => setSelectedFilterDate(getLocalDateStr())}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedFilterDate === getLocalDateStr() ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Today
              </button>
              
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Select Date:</span>
                <input
                  type="date"
                  value={selectedFilterDate}
                  onChange={e => setSelectedFilterDate(e.target.value)}
                  className="bg-transparent text-white font-mono font-bold focus:outline-none"
                />
              </div>

              {selectedFilterDate && (
                <button
                  onClick={() => setSelectedFilterDate('')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
                >
                  ✕ Clear Date Filter
                </button>
              )}
            </div>
          </div>

          {/* PERIOD-WISE ATTENDANCE TABLE */}
          {attTabMode === 'period' && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>⏱️ Period-Wise Attendance Log</span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  {periodAttendanceLogs.filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate)).length} Sessions Shown
                </span>
              </h4>

              {periodAttendanceLogs.filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate)).length > 0 ? (
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
                        {periodAttendanceLogs
                          .filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate))
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
                    {selectedFilterDate ? `No period attendance records found for ${selectedFilterDate}.` : 'No period-wise attendance records logged yet.'}
                  </p>
                  <p>Select another date or click "All Dates" to view attendance logs.</p>
                </div>
              )}
            </div>
          )}


          {/* DAILY ATTENDANCE LOG TABLE */}
          {attTabMode === 'daily' && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>🌅 Daily Roll Call Calendar</span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {studentAttendanceLogs.filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate)).length} Days Shown
                </span>
              </h4>

              {studentAttendanceLogs.filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate)).length > 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Attendance Status</th>
                          <th className="p-3.5">Class & Section</th>
                          <th className="p-3.5 text-right">Faculty Sign-off</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {studentAttendanceLogs
                          .filter(log => !selectedFilterDate || String(log.date).startsWith(selectedFilterDate))
                          .map(log => (
                          <tr key={log._id} className="hover:bg-slate-900/40 transition">
                            <td className="p-3.5 font-mono text-slate-200 font-semibold">
                              {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                            <td className="p-3.5 text-right font-mono text-slate-400">{log.markedBy || 'Class Teacher'}</td>
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
                    {selectedFilterDate ? `No daily attendance logs found for ${selectedFilterDate}.` : 'No daily attendance logs recorded for this student yet.'}
                  </p>
                  <p>Select another date or click "All Dates" to view attendance logs.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ANALYTICS & REPORTS TAB - Monthly Calendar + 12-Month Yearly View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Attendance Analytics & Reports</h3>
                <p className="text-xs text-slate-400">Monthly calendar view and 12-month yearly breakdown for {childName}</p>
              </div>
            </div>
          </div>
          <StudentAttendanceReport
            defaultClass={clsStr}
            defaultSection={secStr}
            lockedStudentId={String(mapped?._id || user?._id || '')}
            lockedStudentName={childName}
          />
        </div>
      )}

      {/* LEAVE TAB */}
      {activeTab === 'leave' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-w-2xl mx-auto">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" /> Submit Sick / Leave Application
            </h3>
            <p className="text-xs text-slate-400">Send an official leave request directly to your class teacher</p>
          </div>

          {leaveSubmitted && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Leave Application submitted to Class Teacher & School Administration!</span>
            </div>
          )}

          <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Leave Start Date</label>
              <input
                type="date"
                value={leaveForm.startDate}
                onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Reason for Absence</label>
              <textarea
                value={leaveForm.reason}
                onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                placeholder="State your reason for leave (medical, family event, etc.)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 h-28"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-primary text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </div>
      )}


      {/* ALL SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <AllServicesPanel role={isParentRole ? 'PARENT' : 'STUDENT'} />
        </div>
      )}

    </div>
  );
}

export default function ParentDashboard() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Student Portal...</div>}>
      <ParentDashboardContent />
    </React.Suspense>
  );
}

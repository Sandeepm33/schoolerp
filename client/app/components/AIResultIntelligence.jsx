'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Award, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, 
  Filter, Search, Sparkles, Brain, BarChart3, Users, BookOpen, ChevronRight, 
  ChevronLeft, Printer, Download, RefreshCw, Sliders, ShieldAlert, Eye, 
  Grid, FileText, Layers, PieChart, ArrowUpRight, ArrowDownRight, Lightbulb, 
  Zap, Check, X, Building, User, GraduationCap, Star, LayoutGrid, List, RotateCcw
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDataSync } from '../context/DataSyncContext';

export default function AIResultIntelligence({ activeRoleProp, embeddedInParent = false }) {
  const { token, user } = useAuth();
  const { currentTheme } = useTheme();

  // Design Tokens
  const brandColor = currentTheme?.accentPrimary || '#02563d';
  const brandSecondary = currentTheme?.accentSecondary || '#02422f';
  const cyanColor = currentTheme?.accentCyan || '#12c4ac';

  // Role Scoping
  const userRoleStr = String(activeRoleProp || user?.role || user?.designation || '').toUpperCase();
  const isParent = userRoleStr.includes('PARENT');
  const isStudent = userRoleStr.includes('STUDENT');
  const isTeacher = userRoleStr.includes('TEACHER') && !userRoleStr.includes('HEADMASTER') && !userRoleStr.includes('PRINCIPAL');
  const isClassTeacher = userRoleStr.includes('CLASS_TEACHER') || (isTeacher && user?.assignedClass);
  const isHeadmaster = userRoleStr.includes('HEADMASTER') || userRoleStr.includes('HEAD_MASTER');
  const isPrincipal = userRoleStr.includes('PRINCIPAL') || userRoleStr.includes('VICE_PRINCIPAL') || userRoleStr.includes('SCHOOL_ADMIN') || userRoleStr.includes('SUPER_ADMIN');
  const isParentOrStudentView = isParent || isStudent || Boolean(embeddedInParent);

  // State Management
  const [marksData, setMarksData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedResultStatus, setSelectedResultStatus] = useState(''); // 'ALL', 'PASS', 'FAIL'
  const [selectedGrade, setSelectedGrade] = useState(''); // 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'
  const [selectedRiskTier, setSelectedRiskTier] = useState(''); // 'EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'AT_RISK', 'CRITICAL'
  const [selectedScoreRange, setSelectedScoreRange] = useState(''); // '90-100', '75-89', '50-74', 'below-50'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'heatmap', 'risk_detector', 'comparison', 'student_roster'

  // Modals / Drawers
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Clean Helpers
  const cleanClass = (cls) => cls ? String(cls).replace(/^Class\s+/i, '').trim() : '';
  const cleanSection = (sec) => sec && sec !== '-' ? String(sec).replace(/^Section\s+/i, '').trim() : '';

  // Data Fetcher
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      let marksEndpoint = `${API_BASE}/marks`;
      if (isPrincipal || isHeadmaster || isTeacher) {
        marksEndpoint = `${API_BASE}/admin/marks`;
      }
      if (isParent || isStudent) {
        const stId = user?.mappedStudentId || user?.studentId || user?._id;
        if (stId) marksEndpoint = `${API_BASE}/marks?studentId=${encodeURIComponent(stId)}`;
      }

      const [marksRes, studentsRes, classesRes, examsRes] = await Promise.all([
        fetch(marksEndpoint, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/students`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/classes`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/exams`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      const marksArr = Array.isArray(marksRes) ? marksRes : (marksRes?.records || []);
      setMarksData(marksArr);
      setStudentsData(Array.isArray(studentsRes) ? studentsRes : []);
      setClassesData(Array.isArray(classesRes) ? classesRes : []);
      setExamsData(Array.isArray(examsRes) ? examsRes : []);
    } catch (err) {
      console.error('Failed to fetch AI Result Intelligence data', err);
    } finally {
      setLoading(false);
    }
  }, [token, isPrincipal, isHeadmaster, isTeacher, isParent, isStudent, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDataSync(fetchData);

  // Derived Filter Options
  const availableExams = useMemo(() => {
    const set = new Set();
    marksData.forEach(m => { if (m.examTitle) set.add(m.examTitle); });
    examsData.forEach(e => { if (e.title) set.add(e.title); });
    return Array.from(set).sort();
  }, [marksData, examsData]);

  const availableClasses = useMemo(() => {
    const set = new Set();
    marksData.forEach(m => { if (m.classId) set.add(cleanClass(m.classId)); });
    classesData.forEach(c => { if (c.className) set.add(cleanClass(c.className)); });
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [marksData, classesData]);

  const availableSections = useMemo(() => {
    const set = new Set();
    marksData.forEach(m => { if (m.sectionId) set.add(cleanSection(m.sectionId)); });
    return Array.from(set).filter(Boolean).sort();
  }, [marksData]);

  const availableSubjects = useMemo(() => {
    const set = new Set();
    marksData.forEach(m => {
      if (m.subjectName) set.add(m.subjectName);
      if (Array.isArray(m.subjectMarks)) {
        m.subjectMarks.forEach(sm => {
          if (sm.subject || sm.subjectName) set.add(sm.subject || sm.subjectName);
        });
      }
    });
    return Array.from(set).filter(Boolean).sort();
  }, [marksData]);

  // Unified Student Performance Evaluator
  const processedStudentRecords = useMemo(() => {
    // Map marks by Student key (studentId or studentName)
    const map = new Map();

    marksData.forEach(m => {
      const key = String(m.studentId || m.studentName || 'unknown').toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          studentId: m.studentId,
          studentName: m.studentName || 'Student',
          rollNo: m.rollNo || '—',
          classId: cleanClass(m.classId),
          sectionId: cleanSection(m.sectionId),
          examTitle: m.examTitle || 'General Exam',
          subjects: [],
          totalMarksObtained: 0,
          totalMaxMarks: 0,
          rawRecords: []
        });
      }

      const rec = map.get(key);
      rec.rawRecords.push(m);

      if (Array.isArray(m.subjectMarks) && m.subjectMarks.length > 0) {
        m.subjectMarks.forEach(sm => {
          const sName = sm.subject || sm.subjectName || m.subjectName || 'General';
          const obt = Number(sm.marksObtained ?? 0);
          const max = Number(sm.maxMarks ?? 100);
          const passM = Number(sm.passingMarks ?? 35);
          const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
          const isPass = obt >= passM;

          rec.subjects.push({
            subjectName: sName,
            marksObtained: obt,
            maxMarks: max,
            passingMarks: passM,
            percentage: pct,
            isPass,
            grade: isPass ? (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D') : 'F'
          });
          rec.totalMarksObtained += obt;
          rec.totalMaxMarks += max;
        });
      } else {
        const sName = m.subjectName || 'General Subject';
        const obt = Number(m.totalMarksObtained ?? m.marksObtained ?? 0);
        const max = Number(m.totalMaxMarks ?? m.maxMarks ?? 100);
        const passM = Number(m.passingMarks ?? 35);
        const pct = m.percentage !== undefined ? Number(m.percentage) : (max > 0 ? Math.round((obt / max) * 100) : 0);
        const isPass = pct >= 35;

        rec.subjects.push({
          subjectName: sName,
          marksObtained: obt,
          maxMarks: max,
          passingMarks: passM,
          percentage: pct,
          isPass,
          grade: isPass ? (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D') : 'F'
        });
        rec.totalMarksObtained += obt;
        rec.totalMaxMarks += max;
      }
    });

    // Compute Overall Percentage, Grade, Rank & Risk Tiers
    const list = Array.from(map.values()).map(s => {
      const overallPct = s.totalMaxMarks > 0 
        ? Math.round((s.totalMarksObtained / s.totalMaxMarks) * 100) 
        : (s.subjects.length > 0 ? Math.round(s.subjects.reduce((a, b) => a + b.percentage, 0) / s.subjects.length) : 0);
      
      const failedSubjects = s.subjects.filter(sub => !sub.isPass);
      const passedSubjectsCount = s.subjects.length - failedSubjects.length;
      const overallPass = failedSubjects.length === 0;

      // Grade Calculation
      let grade = 'F';
      if (overallPass) {
        if (overallPct >= 90) grade = 'A+';
        else if (overallPct >= 80) grade = 'A';
        else if (overallPct >= 70) grade = 'B+';
        else if (overallPct >= 60) grade = 'B';
        else if (overallPct >= 50) grade = 'C';
        else grade = 'D';
      }

      // Risk Tier Calculation
      let riskTier = 'GOOD';
      if (failedSubjects.length >= 2 || overallPct < 40) riskTier = 'CRITICAL';
      else if (failedSubjects.length === 1 || overallPct < 50) riskTier = 'AT_RISK';
      else if (overallPct < 70) riskTier = 'NEEDS_IMPROVEMENT';
      else if (overallPct >= 85) riskTier = 'EXCELLENT';
      else riskTier = 'GOOD';

      // Find Linked Student DB Metadata (Attendance, Photo, etc.)
      const matchedStudentDoc = studentsData.find(st => 
        String(st._id) === String(s.studentId) ||
        `${st.firstName || ''} ${st.lastName || ''}`.trim().toLowerCase() === s.studentName.toLowerCase() ||
        (st.rollNo && String(st.rollNo).trim() === String(s.rollNo).trim())
      );

      return {
        ...s,
        overallPct,
        grade,
        overallPass,
        failedSubjects,
        passedSubjectsCount,
        riskTier,
        attendancePercentage: matchedStudentDoc?.attendancePercentage || 92,
        parentName: matchedStudentDoc?.parentName || 'Parent / Guardian',
        parentPhone: matchedStudentDoc?.parentPhone || '—'
      };
    });

    // Class & Section Grouped Academic Rank Calculator
    // Rule: Passed students (overallPass === true) are ranked #1, #2, #3... by percentage descending.
    // Students with failed subjects (Grade F) are marked as rank null (N/A).
    const classGroups = new Map();
    list.forEach(s => {
      const gKey = `${s.classId || 'ALL'}_${s.sectionId || 'ALL'}`;
      if (!classGroups.has(gKey)) classGroups.set(gKey, []);
      classGroups.get(gKey).push(s);
    });

    classGroups.forEach(groupList => {
      const passed = groupList.filter(s => s.overallPass).sort((a, b) => b.overallPct - a.overallPct);
      const failed = groupList.filter(s => !s.overallPass).sort((a, b) => b.overallPct - a.overallPct);

      passed.forEach((s, idx) => {
        s.rank = idx + 1;
      });
      failed.forEach((s) => {
        s.rank = null; // Failed students do not receive a passing class rank
      });
    });

    // Overall sort for roster view: passed students first, then failed students
    list.sort((a, b) => {
      if (a.overallPass !== b.overallPass) return a.overallPass ? -1 : 1;
      return b.overallPct - a.overallPct;
    });

    return list;
  }, [marksData, studentsData]);

  // Apply Smart Filter Bar to Roster
  const filteredRoster = useMemo(() => {
    return processedStudentRecords.filter(s => {
      if (selectedExam && s.examTitle !== selectedExam) return false;
      if (selectedClass && s.classId !== selectedClass) return false;
      if (selectedSection && s.sectionId !== selectedSection) return false;

      if (selectedSubject) {
        const hasSubject = s.subjects.some(sub => sub.subjectName === selectedSubject);
        if (!hasSubject) return false;
      }

      if (selectedResultStatus === 'PASS' && !s.overallPass) return false;
      if (selectedResultStatus === 'FAIL' && s.overallPass) return false;

      if (selectedGrade && s.grade !== selectedGrade) return false;
      if (selectedRiskTier && s.riskTier !== selectedRiskTier) return false;

      if (selectedScoreRange === '90-100' && s.overallPct < 90) return false;
      if (selectedScoreRange === '75-89' && (s.overallPct < 75 || s.overallPct > 89)) return false;
      if (selectedScoreRange === '50-74' && (s.overallPct < 50 || s.overallPct > 74)) return false;
      if (selectedScoreRange === 'below-50' && s.overallPct >= 50) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = s.studentName.toLowerCase().includes(q);
        const rollMatch = String(s.rollNo).toLowerCase().includes(q);
        const classMatch = s.classId.toLowerCase().includes(q);
        if (!nameMatch && !rollMatch && !classMatch) return false;
      }

      return true;
    });
  }, [processedStudentRecords, selectedExam, selectedClass, selectedSection, selectedSubject, selectedResultStatus, selectedGrade, selectedRiskTier, selectedScoreRange, searchQuery]);
  // Tier Count Calculator (Counts Subjects for Parent/Student, Counts Students for Admin/Teacher)
  const getTierCount = useCallback((tierKey) => {
    if (isParentOrStudentView) {
      const child = processedStudentRecords[0];
      if (!child || !child.subjects) return 0;
      return child.subjects.filter(sub => {
        const pct = sub.percentage;
        if (tierKey === 'EXCELLENT') return pct >= 85;
        if (tierKey === 'GOOD') return pct >= 70 && pct < 85;
        if (tierKey === 'NEEDS_IMPROVEMENT') return pct >= 50 && pct < 70;
        if (tierKey === 'AT_RISK') return pct >= 35 && pct < 50;
        if (tierKey === 'CRITICAL') return !sub.isPass || pct < 35;
        return false;
      }).length;
    }
    return processedStudentRecords.filter(s => s.riskTier === tierKey).length;
  }, [isParentOrStudentView, processedStudentRecords]);

  const getUnitText = useCallback((count) => {
    if (isParentOrStudentView) {
      return count === 1 ? 'Subject' : 'Subjects';
    }
    return count === 1 ? 'Student' : 'Students';
  }, [isParentOrStudentView]);

  const childSubjectsToDisplay = useMemo(() => {
    const child = processedStudentRecords[0];
    if (!child || !child.subjects) return [];
    
    // Initially (no tier card clicked): Do NOT show any subjects by default until a tier card is clicked
    if (!selectedRiskTier) return [];

    return child.subjects.filter(sub => {
      const pct = sub.percentage;
      if (selectedRiskTier === 'EXCELLENT') return pct >= 85;
      if (selectedRiskTier === 'GOOD') return pct >= 70 && pct < 85;
      if (selectedRiskTier === 'NEEDS_IMPROVEMENT') return pct >= 50 && pct < 70;
      if (selectedRiskTier === 'AT_RISK') return pct >= 35 && pct < 50;
      if (selectedRiskTier === 'CRITICAL') return !sub.isPass || pct < 35;
      return false;
    });
  }, [processedStudentRecords, selectedRiskTier]);

  // Aggregate Metrics & Subject Analytics
  const analyticsSummary = useMemo(() => {
    const totalCount = filteredRoster.length;
    if (totalCount === 0) {
      return {
        totalStudents: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        riskCount: 0,
        criticalCount: 0,
        gradeCounts: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
        subjectStats: [],
        aiInsightText: 'No student exam mark records found matching the active filters.',
        recommendedActions: []
      };
    }

    let totalSum = 0;
    let passCount = 0;
    let failCount = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let riskCount = 0;
    let criticalCount = 0;
    const gradeCounts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

    filteredRoster.forEach(s => {
      totalSum += s.overallPct;
      if (s.overallPass) passCount++;
      else failCount++;

      if (s.overallPct > highestScore) highestScore = s.overallPct;
      if (s.overallPct < lowestScore) lowestScore = s.overallPct;

      if (s.riskTier === 'AT_RISK' || s.riskTier === 'CRITICAL') riskCount++;
      if (s.riskTier === 'CRITICAL') criticalCount++;

      if (gradeCounts[s.grade] !== undefined) gradeCounts[s.grade]++;
    });

    const passRate = Math.round((passCount / totalCount) * 100);
    const avgScore = Math.round(totalSum / totalCount);

    // Subject-wise Breakdown
    const subMap = new Map();
    filteredRoster.forEach(s => {
      s.subjects.forEach(sub => {
        if (!subMap.has(sub.subjectName)) {
          subMap.set(sub.subjectName, {
            subjectName: sub.subjectName,
            totalMarks: 0,
            count: 0,
            passCount: 0,
            failCount: 0,
            highest: 0,
            lowest: 100
          });
        }
        const st = subMap.get(sub.subjectName);
        st.totalMarks += sub.percentage;
        st.count += 1;
        if (sub.isPass) st.passCount += 1;
        else st.failCount += 1;
        if (sub.percentage > st.highest) st.highest = sub.percentage;
        if (sub.percentage < st.lowest) st.lowest = sub.percentage;
      });
    });

    const subjectStats = Array.from(subMap.values()).map(sub => ({
      ...sub,
      avgPct: sub.count > 0 ? Math.round(sub.totalMarks / sub.count) : 0,
      passRate: sub.count > 0 ? Math.round((sub.passCount / sub.count) * 100) : 0
    })).sort((a, b) => a.avgPct - b.avgPct);

    const weakestSubject = subjectStats[0] || null;
    const strongestSubject = subjectStats[subjectStats.length - 1] || null;

    // AI Insight Generator
    let aiInsightText = `📊 ${selectedClass ? `Class ${selectedClass}` : 'Institution'} Exam Performance Insight:\n`;
    aiInsightText += `• Overall Pass Rate: ${passRate}% across ${totalCount} evaluated students.\n`;
    if (weakestSubject) {
      aiInsightText += `• ${weakestSubject.subjectName} is currently the lowest-performing subject with an average score of ${weakestSubject.avgPct}% (${weakestSubject.failCount} student failures).\n`;
    }
    if (strongestSubject && strongestSubject.subjectName !== weakestSubject?.subjectName) {
      aiInsightText += `• ${strongestSubject.subjectName} leads as the strongest subject with a ${strongestSubject.passRate}% pass rate (${strongestSubject.avgPct}% average).\n`;
    }
    if (riskCount > 0) {
      aiInsightText += `• ⚠️ ${riskCount} students are classified as academically At-Risk / Critical and require immediate targeted intervention.`;
    } else {
      aiInsightText += `• 🎉 Zero students are currently classified as academically at-risk!`;
    }

    // Recommended Actions
    const recommendedActions = [];
    if (weakestSubject && weakestSubject.avgPct < 70) {
      recommendedActions.push({
        title: `Remedial Sessions for ${weakestSubject.subjectName}`,
        desc: `Schedule targeted review modules for ${weakestSubject.failCount || 'struggling'} students before the upcoming assessment.`
      });
    }
    if (riskCount > 0) {
      recommendedActions.push({
        title: `Parent-Teacher Consultations (${riskCount} At-Risk Students)`,
        desc: `Send automated progress reports and alert parents of students with multiple subject backlogs.`
      });
    }
    if (gradeCounts['A+'] > 0) {
      recommendedActions.push({
        title: `Enrichment Track for Top Performers (${gradeCounts['A+']} A+ Students)`,
        desc: `Provide advanced problem sets and competitive scholarship preparation for high-achieving candidates.`
      });
    }

    return {
      totalStudents: totalCount,
      passCount,
      failCount,
      passRate,
      avgScore,
      highestScore,
      lowestScore: lowestScore === 100 ? 0 : lowestScore,
      riskCount,
      criticalCount,
      gradeCounts,
      subjectStats,
      weakestSubject,
      strongestSubject,
      aiInsightText,
      recommendedActions
    };
  }, [filteredRoster, selectedClass]);

  // Reset Filters Handler
  const resetFilters = () => {
    setSelectedExam('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedSubject('');
    setSelectedResultStatus('');
    setSelectedGrade('');
    setSelectedRiskTier('');
    setSelectedScoreRange('');
    setSearchQuery('');
  };

  return (
    <div id="ai-result-intelligence-section" className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* HERO BANNER - AI RESULT INTELLIGENCE CENTER */}
      <div 
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4 shadow-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-xl border-2 shrink-0"
              style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' }}
            >
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span 
                  className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  AI Academic Intelligence Center
                </span>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(52,211,153,0.25)', color: '#a7f3d0', borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  <Sparkles className="w-3 h-3 text-emerald-300" /> Automated Analytics Active
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black mt-1 tracking-tight" style={{ color: '#ffffff' }}>
                Result Intelligence &amp; Analytics System
              </h1>
              <p className="text-xs font-semibold mt-1" style={{ color: '#e2e8f0' }}>
                Role Context: <strong style={{ color: '#fde047' }}>{userRoleStr.replace('_', ' ')}</strong> • <span style={{ color: '#e2e8f0' }}>Automated exam insights, student risk detection, subject heatmaps &amp; instant reports.</span>
              </p>
            </div>
          </div>

          {/* QUICK TOP STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs p-3.5 rounded-2xl border" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', borderColor: 'rgba(255, 255, 255, 0.25)' }}>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>
                {isParentOrStudentView ? 'Evaluated Subjects' : 'Evaluated Roster'}
              </span>
              <strong className="text-lg font-black block" style={{ color: '#ffffff' }}>
                {isParentOrStudentView ? (filteredRoster[0]?.subjects?.length || 0) : analyticsSummary.totalStudents}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Overall Pass Rate</span>
              <strong className="text-lg font-black block" style={{ color: '#34d399' }}>{analyticsSummary.passRate}%</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>
                {isParentOrStudentView ? 'Average Score' : 'Class Avg Score'}
              </span>
              <strong className="text-lg font-black block" style={{ color: '#fcd34d' }}>{analyticsSummary.avgScore}%</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>
                {isParentOrStudentView ? 'Failed Subjects' : 'At Risk / Critical'}
              </span>
              <strong className="text-lg font-black block" style={{ color: (isParentOrStudentView ? (filteredRoster[0]?.failedSubjects?.length || 0) : analyticsSummary.riskCount) > 0 ? '#f87171' : '#34d399' }}>
                {isParentOrStudentView ? (filteredRoster[0]?.failedSubjects?.length || 0) : analyticsSummary.riskCount}
              </strong>
            </div>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/20 flex-wrap">
          {[
            { id: 'overview', label: '📊 Overview & AI Insights', icon: BarChart3 },
            { id: 'heatmap', label: '🔥 Result Heatmap Matrix', icon: Grid },
            { id: 'risk_detector', label: '🚨 Student Risk Detector', icon: ShieldAlert },
            { id: 'comparison', label: '⚡ Comparison Engine', icon: Layers },
            { id: 'student_roster', label: '🔍 Student Evaluation Roster', icon: Users }
          ].map(tab => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isSel 
                  ? { backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' } 
                  : { backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                  isSel ? 'shadow-lg font-black scale-105' : 'hover:bg-black/40'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}

          {isParentOrStudentView && processedStudentRecords.length > 0 && (
            <button
              onClick={() => setSelectedStudentProfile(processedStudentRecords[0])}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <Eye className="w-4 h-4" /> Inspect Full Performance Intelligence
            </button>
          )}

          <button
            onClick={() => setIsExportModalOpen(true)}
            className={`${isParentOrStudentView ? '' : 'ml-auto'} px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-lg cursor-pointer`}
          >
            <Printer className="w-4 h-4" />
            <span>Generate &amp; Print Report</span>
          </button>
        </div>
      </div>

      {/* SMART MULTI-DIMENSIONAL FILTER BAR */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Smart Result Intelligence Filters
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, roll no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {(selectedExam || selectedClass || selectedSection || selectedSubject || selectedResultStatus || selectedGrade || selectedRiskTier || selectedScoreRange || searchQuery) && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* DROPDOWN SELECTORS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Exam</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Exams ({availableExams.length})</option>
              {availableExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Classes ({availableClasses.length})</option>
              {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Sections</option>
              {availableSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Subjects ({availableSubjects.length})</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Result</label>
            <select
              value={selectedResultStatus}
              onChange={e => setSelectedResultStatus(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Results</option>
              <option value="PASS">Pass Only ✓</option>
              <option value="FAIL">Fail Only ✕</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Grade</label>
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Grades</option>
              {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Risk Tier</label>
            <select
              value={selectedRiskTier}
              onChange={e => setSelectedRiskTier(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Tiers</option>
              <option value="EXCELLENT">🟢 Excellent (85%+)</option>
              <option value="GOOD">🔵 Good (70-84%)</option>
              <option value="NEEDS_IMPROVEMENT">🟡 Needs Impr. (50-69%)</option>
              <option value="AT_RISK">🟠 At Risk (&lt;50%)</option>
              <option value="CRITICAL">🔴 Critical (Multi-Fail)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Score Range</label>
            <select
              value={selectedScoreRange}
              onChange={e => setSelectedScoreRange(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Ranges</option>
              <option value="90-100">90% – 100%</option>
              <option value="75-89">75% – 89%</option>
              <option value="50-74">50% – 74%</option>
              <option value="below-50">Below 50%</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & AI INSIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* AI EXECUTIVE INSIGHT PANEL */}
          <div 
            className="p-6 rounded-3xl border shadow-xl space-y-4"
            style={{
              background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/20 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300 border border-white/20">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Automated Result Insights Panel
                  </h3>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    Live AI algorithmic analysis based on active filters
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Real-time Computed
              </span>
            </div>

            {/* STRUCTURED SOLID WHITE INSIGHT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Pass Rate Insight */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-900 space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Overall Pass Rate</span>
                </div>
                <p className="text-base font-black text-slate-900 flex items-baseline gap-2">
                  <span className="text-2xl text-emerald-600 font-mono">{analyticsSummary.passRate}%</span>
                  <span className="text-xs font-semibold text-slate-500">across {analyticsSummary.totalStudents} evaluated candidates</span>
                </p>
              </div>

              {/* Weakest Subject Insight */}
              {analyticsSummary.weakestSubject && (
                <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-md text-slate-900 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-700">Lowest-Performing Subject</span>
                  </div>
                  <p className="text-base font-black text-slate-900 flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl text-rose-600 font-extrabold">{analyticsSummary.weakestSubject.subjectName}</span>
                    <span className="text-xs font-semibold text-slate-500">({analyticsSummary.weakestSubject.avgPct}% avg, {analyticsSummary.weakestSubject.failCount} failures)</span>
                  </p>
                </div>
              )}

              {/* Strongest Subject Insight */}
              {analyticsSummary.strongestSubject && analyticsSummary.strongestSubject.subjectName !== analyticsSummary.weakestSubject?.subjectName && (
                <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-md text-slate-900 space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">Top Performing Subject</span>
                  </div>
                  <p className="text-base font-black text-slate-900 flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl text-blue-600 font-extrabold">{analyticsSummary.strongestSubject.subjectName}</span>
                    <span className="text-xs font-semibold text-slate-500">({analyticsSummary.strongestSubject.passRate}% pass rate, {analyticsSummary.strongestSubject.avgPct}% avg)</span>
                  </p>
                </div>
              )}

              {/* Risk Level Insight */}
              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-md text-slate-900 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${analyticsSummary.riskCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span className={`text-xs font-black uppercase tracking-wider ${analyticsSummary.riskCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>Academic Risk Status</span>
                </div>
                <p className="text-sm font-black text-slate-900">
                  {analyticsSummary.riskCount > 0 ? (
                    <span className="text-amber-700 font-bold">⚠️ {analyticsSummary.riskCount} At-Risk / Critical Students requiring intervention</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">🎉 Zero students currently classified at-risk</span>
                  )}
                </p>
              </div>
            </div>

            {/* ACTIONABLE RECOMMENDATIONS */}
            {analyticsSummary.recommendedActions.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-white/20">
                <span className="text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-950 shadow-md border border-slate-200">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Automated Recommended Actions:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analyticsSummary.recommendedActions.map((act, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1 text-slate-900" 
                    >
                      <h4 className="text-xs font-black text-indigo-950">{act.title}</h4>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{act.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isParentOrStudentView && processedStudentRecords.length > 0 && (
              <div className="pt-3 border-t border-white/20 flex justify-end">
                <button
                  onClick={() => setSelectedStudentProfile(processedStudentRecords[0])}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border border-white/30"
                >
                  <Eye className="w-4 h-4" /> Inspect Full Performance Intelligence
                </button>
              </div>
            )}
          </div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500">Evaluated Candidates</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-slate-900">{analyticsSummary.totalStudents}</h3>
                <span className="text-xs font-bold text-slate-500">Students</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {analyticsSummary.passCount} Passed • {analyticsSummary.failCount} Failed
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500">Overall Pass Rate</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-emerald-600">{analyticsSummary.passRate}%</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Target: 80%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${analyticsSummary.passRate}%` }} />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-amber-200/80 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500">Class Average Score</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-amber-600">{analyticsSummary.avgScore}%</h3>
                <span className="text-xs font-bold text-slate-500">High: {analyticsSummary.highestScore}%</span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-slate-100">
                Lowest Student Score: {analyticsSummary.lowestScore}%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-rose-200/80 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500">At Risk Candidates</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-rose-600">{analyticsSummary.riskCount}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {analyticsSummary.criticalCount} Critical
                </span>
              </div>
              <button
                onClick={() => { setActiveTab('risk_detector'); }}
                className="text-[11px] text-rose-600 font-extrabold hover:underline pt-1 border-t border-slate-100 flex items-center justify-between w-full cursor-pointer"
              >
                <span>View At-Risk Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2-COLUMN GRID: GRADE DISTRIBUTION & SUBJECT BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* GRADE DISTRIBUTION BREAKDOWN */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600" /> Grade Distribution Spectrum
                </h3>
                <span className="text-xs text-slate-500 font-mono font-bold">Total: {analyticsSummary.totalStudents} Candidates</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Object.entries(analyticsSummary.gradeCounts).map(([grade, count]) => {
                  const pct = analyticsSummary.totalStudents > 0 ? Math.round((count / analyticsSummary.totalStudents) * 100) : 0;
                  const isFail = grade === 'F';
                  return (
                    <div key={grade} className={`p-3 rounded-2xl border text-center space-y-1 ${isFail ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-xs font-black block ${isFail ? 'text-rose-700' : 'text-slate-900'}`}>{grade}</span>
                      <strong className={`text-lg font-black block ${isFail ? 'text-rose-600' : 'text-indigo-600'}`}>{count}</strong>
                      <span className="text-[10px] text-slate-500 font-semibold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUBJECT PERFORMANCE SUMMARY */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Subject Averages &amp; Pass Rates
                </h3>
                <span className="text-xs text-indigo-600 font-bold">{analyticsSummary.subjectStats.length} Subjects Evaluated</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {analyticsSummary.subjectStats.map(sub => (
                  <div key={sub.subjectName} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">{sub.subjectName}</span>
                      <span className="font-mono font-bold text-slate-700">Avg: <strong className="text-indigo-600">{sub.avgPct}%</strong> • Pass: <strong className="text-emerald-600">{sub.passRate}%</strong></span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${sub.avgPct >= 75 ? 'bg-emerald-500' : sub.avgPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${sub.avgPct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESULT HEATMAP MATRIX */}
      {activeTab === 'heatmap' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-600" /> Subject-by-Subject Student Result Heatmap
              </h3>
              <p className="text-xs text-slate-500">Color-coded academic matrix to identify weak subject clusters instantly</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-3 h-3 rounded-full bg-emerald-500" /> 75%+ High</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="w-3 h-3 rounded-full bg-amber-500" /> 50–74% Average</span>
              <span className="flex items-center gap-1 text-rose-700"><span className="w-3 h-3 rounded-full bg-rose-500" /> &lt;50% Fail</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 font-mono">Rank</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  {availableSubjects.map(sub => (
                    <th key={sub} className="p-3 text-center">{sub}</th>
                  ))}
                  <th className="p-3 text-center">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.map((s, idx) => (
                  <tr key={s.studentId || s.studentName || idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-extrabold text-slate-500">
                      {s.rank ? `#${s.rank}` : <span className="text-rose-500 font-bold">N/A</span>}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <button
                        onClick={() => setSelectedStudentProfile(s)}
                        className="hover:text-indigo-600 hover:underline cursor-pointer text-left"
                      >
                        {s.studentName}
                      </button>
                    </td>
                    <td className="p-3 font-medium text-slate-600">Class {s.classId}{s.sectionId ? `-${s.sectionId}` : ''}</td>
                    {availableSubjects.map(subName => {
                      const matchSub = s.subjects.find(sub => sub.subjectName === subName);
                      if (!matchSub) {
                        return <td key={subName} className="p-3 text-center text-slate-300 font-mono">—</td>;
                      }
                      const pct = matchSub.percentage;
                      const badgeBg = matchSub.isPass 
                        ? (pct >= 75 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')
                        : 'bg-rose-500 text-white';

                      return (
                        <td key={subName} className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black shadow-sm inline-block min-w-[45px] ${badgeBg}`}>
                            {pct}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border ${s.overallPass ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'}`}>
                        {s.overallPct}% ({s.grade})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUTOMATED STUDENT RISK DETECTOR */}
      {activeTab === 'risk_detector' && (
        <div className="space-y-6">

          {/* RISK TIER SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { key: 'EXCELLENT', title: '🟢 Excellent', threshold: '85%+' },
              { key: 'GOOD', title: '🔵 Good', threshold: '70–84%' },
              { key: 'NEEDS_IMPROVEMENT', title: '🟡 Needs Impr.', threshold: '50–69%' },
              { key: 'AT_RISK', title: '🟠 At Risk', threshold: '35–49%' },
              { key: 'CRITICAL', title: '🔴 Critical', threshold: 'Fail (<35%)' }
            ].map(tier => {
              const count = getTierCount(tier.key);
              const unitLabel = getUnitText(count);
              const isSel = selectedRiskTier === tier.key;
              return (
                <button
                  key={tier.key}
                  onClick={() => setSelectedRiskTier(isSel ? '' : tier.key)}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition cursor-pointer ${
                    isSel ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <span className="text-xs font-extrabold block text-slate-600">{tier.title}</span>
                  <strong className="text-2xl font-black block">{count} <span className="text-xs font-normal">{unitLabel}</span></strong>
                  <span className="text-[10px] text-slate-400 font-mono">Score: {tier.threshold}</span>
                </button>
              );
            })}
          </div>

          {/* AT-RISK CANDIDATES / SUBJECT PERFORMANCE ROSTER */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                {isParentOrStudentView ? 'Subject Performance & Risk Classifier' : 'Automated At-Risk Intervention Roster'}
              </h3>
              <span className="text-xs font-extrabold text-indigo-600">
                {isParentOrStudentView
                  ? `Showing ${childSubjectsToDisplay.length} Subject(s) ${selectedRiskTier ? `in ${selectedRiskTier.replace('_', ' ')} Tier` : ''}`
                  : `${filteredRoster.filter(s => s.riskTier === 'AT_RISK' || s.riskTier === 'CRITICAL').length} Student(s) Needing Immediate Attention`
                }
              </span>
            </div>

            {isParentOrStudentView ? (
              /* PARENT / STUDENT VIEW: SUBJECT INTEL CARDS OR FRIENDLY PROMPT */
              childSubjectsToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {childSubjectsToDisplay.map((sub, idx) => {
                    const isFail = !sub.isPass;
                    const pct = sub.percentage;
                    
                    return (
                      <div key={idx} className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${isFail ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50'}`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-base">{sub.subjectName}</span>
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${isFail ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                              {isFail ? '✕ FAIL' : '✓ PASS'}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-xs text-slate-500 font-semibold">Marks Obtained:</span>
                            <span className="font-mono font-black text-sm text-slate-900">{sub.marksObtained} / {sub.maxMarks}</span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-slate-500 font-semibold">Score Percentage:</span>
                            <span className={`font-mono font-black text-lg ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {pct}% ({sub.grade})
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                            <span className="font-extrabold text-slate-800 block text-[11px]">AI Subject Guidance:</span>
                            <p className="text-[11px] leading-relaxed">
                              {isFail 
                                ? `Remedial practice required for ${sub.subjectName}. Score is below passing threshold (${sub.passingMarks}).` 
                                : pct >= 85 
                                ? `Excellent mastery in ${sub.subjectName}! Recommended for advanced problem-solving tracks.` 
                                : `Satisfactory performance in ${sub.subjectName}. Targeted revision recommended before upcoming exam.`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStudentProfile(processedStudentRecords[0])}
                          className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                        >
                          <Eye className="w-4 h-4" /> Inspect Full Performance Intelligence
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <Filter className="w-5 h-5" />
                  </div>
                  <p className="font-extrabold text-slate-800 text-sm">
                    {selectedRiskTier 
                      ? `No subjects found in ${selectedRiskTier.replace('_', ' ')} Tier.`
                      : 'Click any Performance Tier card above to inspect subjects'
                    }
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {selectedRiskTier
                      ? 'Select another tier card above to inspect performance.'
                      : 'Click Excellent (85%+), Good (70-84%), Needs Impr. (50-69%), At Risk (35-49%), or Critical (Fail) to view subject breakdown.'
                    }
                  </p>
                  <button
                    onClick={() => setSelectedStudentProfile(processedStudentRecords[0])}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Inspect Full Performance Intelligence
                  </button>
                </div>
              )
            ) : (
              /* TEACHER / ADMIN VIEW: STUDENT RISK ROSTER */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoster.filter(s => s.riskTier === 'AT_RISK' || s.riskTier === 'CRITICAL').map(s => (
                  <div key={s.rank} className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-rose-200 text-rose-900 border border-rose-300">
                          {s.riskTier === 'CRITICAL' ? '🔴 CRITICAL RISK' : '🟠 AT-RISK'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">Class {s.classId}-{s.sectionId} • Roll: {s.rollNo}</span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-base">{s.studentName}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Parent: <strong className="text-slate-800">{s.parentName}</strong> ({s.parentPhone})
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span>Overall Score: <strong className="text-rose-600">{s.overallPct}%</strong></span>
                          <span className="text-rose-700 font-mono">Failed: {s.failedSubjects.length} Subject(s)</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {s.failedSubjects.map(sub => (
                            <span key={sub.subjectName} className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              {sub.subjectName}: {sub.marksObtained}/{sub.maxMarks} ({sub.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudentProfile(s)}
                      className="w-full py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Full Performance Intelligence
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 4: COMPARISON ENGINE */}
      {activeTab === 'comparison' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Academic Comparison Engine
            </h3>
            <p className="text-xs text-slate-500">Cross-class, cross-section &amp; subject baseline benchmark comparator</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COMPARISON CARD 1: SUBJECT VS CLASS AVERAGE */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Subject Average vs Baseline Benchmark
              </h4>

              <div className="space-y-3">
                {analyticsSummary.subjectStats.map(sub => {
                  const diff = sub.avgPct - analyticsSummary.avgScore;
                  return (
                    <div key={sub.subjectName} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{sub.subjectName}</span>
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span>Avg: {sub.avgPct}%</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] ${diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {diff >= 0 ? `+${diff}%` : `${diff}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COMPARISON CARD 2: TOP PERFORMERS VS AT-RISK CLUSTERS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Top Performers vs At-Risk Cluster Comparison
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800">High Performers (&gt;80%)</span>
                  <strong className="text-2xl font-black text-emerald-900 block">
                    {filteredRoster.filter(s => s.overallPct >= 80).length}
                  </strong>
                  <p className="text-[11px] text-emerald-700">Eligible for honors &amp; advanced prep.</p>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-rose-800">Remedial Focus (&lt;50%)</span>
                  <strong className="text-2xl font-black text-rose-900 block">
                    {filteredRoster.filter(s => s.overallPct < 50).length}
                  </strong>
                  <p className="text-[11px] text-rose-700">Requires mandatory faculty follow-up.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: STUDENT EVALUATION ROSTER */}
      {activeTab === 'student_roster' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Complete Student Result Intelligence Roster
              </h3>
              <p className="text-xs text-slate-500">Showing {filteredRoster.length} evaluated student profiles</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 font-mono">Rank</th>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Class / Section</th>
                  <th className="p-3.5 text-center">Score %</th>
                  <th className="p-3.5 text-center">Grade</th>
                  <th className="p-3.5 text-center">Passed Subjects</th>
                  <th className="p-3.5 text-center">Risk Tier</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.map((s, idx) => (
                  <tr key={s.studentId || s.studentName || idx} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-black text-indigo-600">
                      {s.rank ? `#${s.rank}` : <span className="text-rose-500 font-bold">N/A</span>}
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-slate-700">{s.rollNo}</td>
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-black shrink-0">
                        {s.studentName[0]}
                      </div>
                      <span>{s.studentName}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">Class {s.classId} {s.sectionId ? `(${s.sectionId})` : ''}</td>
                    <td className="p-3.5 text-center font-mono font-black text-sm text-indigo-900">{s.overallPct}%</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-700">
                      {s.passedSubjectsCount} / {s.subjects.length}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                        s.riskTier === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        s.riskTier === 'AT_RISK' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        s.riskTier === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {s.riskTier.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudentProfile(s)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Full Performance Intelligence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDIVIDUAL STUDENT INTELLIGENCE DRAWER / MODAL */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 border-l border-slate-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                    {selectedStudentProfile.studentName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedStudentProfile.studentName}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Class {selectedStudentProfile.classId}-{selectedStudentProfile.sectionId} • Roll: {selectedStudentProfile.rollNo}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentProfile(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* OVERALL METRICS TABLE */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Overall Score</span>
                  <strong className="text-xl font-black text-indigo-600 block mt-0.5">{selectedStudentProfile.overallPct}%</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Grade</span>
                  <strong className="text-xl font-black text-slate-900 block mt-0.5">{selectedStudentProfile.grade}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Class Rank</span>
                  <strong className={`text-xl font-black block mt-0.5 ${selectedStudentProfile.rank ? 'text-amber-600' : 'text-rose-600'}`}>
                    {selectedStudentProfile.rank ? `#${selectedStudentProfile.rank}` : 'N/A (Failed)'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Attendance</span>
                  <strong className="text-xl font-black text-emerald-600 block mt-0.5">{selectedStudentProfile.attendancePercentage}%</strong>
                </div>
              </div>

              {/* SUBJECT BREAKDOWN TABLE */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Subject-by-Subject Breakdown
                </h4>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-center">Obtained</th>
                        <th className="p-3 text-center">Max</th>
                        <th className="p-3 text-center font-mono">%</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedStudentProfile.subjects.map(sub => (
                        <tr key={sub.subjectName} className="hover:bg-white transition">
                          <td className="p-3 font-bold text-slate-900">{sub.subjectName}</td>
                          <td className="p-3 text-center font-mono font-black text-indigo-600">{sub.marksObtained}</td>
                          <td className="p-3 text-center font-mono text-slate-500">{sub.maxMarks}</td>
                          <td className="p-3 text-center font-mono font-black text-amber-600">{sub.percentage}%</td>
                          <td className="p-3 text-center font-bold">{sub.grade}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${sub.isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {sub.isPass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATED AI RECOMMENDATION & ACTION PLAN */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" /> Automated AI Student Action Plan
                </h4>
                <p className="text-indigo-800 leading-relaxed">
                  {selectedStudentProfile.overallPass
                    ? `Student ${selectedStudentProfile.studentName} has passed all subjects with an overall score of ${selectedStudentProfile.overallPct}%. Recommended to maintain consistent revision.`
                    : `Student ${selectedStudentProfile.studentName} requires remedial intervention in ${selectedStudentProfile.failedSubjects.map(f => f.subjectName).join(', ')}. Parent notification advised.`
                  }
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Close Profile Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONE-CLICK REPORT GENERATOR MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" /> Print &amp; Export Official Report
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Generate formatted academic analysis reports based on current active filters ({filteredRoster.length} students included).
            </p>

            <div className="space-y-2">
              {[
                { title: 'Full School Academic Analytics Report (PDF)', desc: 'Executive institutional evaluation summary' },
                { title: 'Class & Section Result Sheet (Print)', desc: 'Printable tabular mark breakdown matrix' },
                { title: 'At-Risk Intervention Roster (Excel/CSV)', desc: 'Export list of candidates needing remediation' }
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => { window.print(); setIsExportModalOpen(false); }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-left space-y-0.5 cursor-pointer"
                >
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>{opt.title}</span>
                    <Download className="w-4 h-4 text-indigo-600" />
                  </h4>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

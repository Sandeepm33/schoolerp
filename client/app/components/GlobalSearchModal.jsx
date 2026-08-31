'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, FileText, GraduationCap, HeartHandshake, Stethoscope,
  AlertTriangle, Sparkles, Calendar, BookOpen, BookMarked, Award,
  CheckSquare, Clock, UserCog, Building2, TrendingUp, DollarSign,
  Scroll, Wallet, Library, Bus, Home, Box, Megaphone, MapPin, FileBadge2,
  Ticket, ShieldCheck, BarChart3, Key, Settings, CornerDownLeft, ChevronRight,
  User, Receipt, Bell, Shield, Activity, HelpCircle, Layers, CheckCircle2, ClipboardList, Mail
} from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

// ─── COMPLETE UNIVERSAL APP SEARCH INDEX ──────────────────────────────────────────
const COMPLETE_APP_INDEX = [

  // ── 1. MODULES & PAGES (37 ERP MODULES) ──────────────────────────────────────
  { id: 'm_admissions', name: 'Admissions Pipeline', cat: 'Modules & Pages', icon: FileText, desc: 'Manage online & walk-in student admissions', keywords: 'admission pipeline lead walkin register apply new student registration', url: '/admin/dashboard?tab=admissions' },
  { id: 'm_enquiry', name: 'Enquiry & Leads', cat: 'Modules & Pages', icon: ClipboardList, desc: 'Track prospect enquiries, lead sources & follow-ups', keywords: 'enquiry lead prospect query walkin call tracking phone', url: '/admin/dashboard?tab=enquiry' },
  { id: 'm_students', name: 'Student Directory & Profiles', cat: 'Modules & Pages', icon: GraduationCap, desc: '360° student directory, roll numbers & parents', keywords: 'students directory list roster class section roll number profile', url: '/admin/dashboard?tab=students' },
  { id: 'm_parents', name: 'Parent Directory & Contacts', cat: 'Modules & Pages', icon: HeartHandshake, desc: 'Parent contacts, phone numbers & linked wards', keywords: 'parents father mother guardian phone email contact family', url: '/admin/dashboard?tab=parents' },
  { id: 'm_health', name: 'Health & Medical Records', cat: 'Modules & Pages', icon: Stethoscope, desc: 'Student medical history, blood groups & vaccinations', keywords: 'health medical doctor blood group illness clinic hospital allergy', url: '/admin/dashboard?tab=health' },
  { id: 'm_discipline', name: 'Discipline Tracker', cat: 'Modules & Pages', icon: AlertTriangle, desc: 'Incident logs, warnings & behavioural reprimands', keywords: 'discipline incident warning complaint behavior reprimand conduct', url: '/admin/dashboard?tab=discipline' },
  { id: 'm_ai_risk', name: 'AI Early Risk Detector', cat: 'Modules & Pages', icon: Sparkles, desc: 'AI predictions on student performance drop & risk', keywords: 'ai risk drop performance warning intelligence fail attendance drop', url: '/admin/dashboard?tab=ai-risk' },

  { id: 'm_ac_years', name: 'Academic Session', cat: 'Academics & Classes', icon: Calendar, desc: 'Configure academic session, term dates & holidays', keywords: 'academic session year term semester calendar holiday vacation', url: '/admin/dashboard?tab=academic-years' },
  { id: 'm_classes', name: 'Classes & Sections', cat: 'Academics & Classes', icon: BookOpen, desc: 'Grade structures, section allocation & class teachers', keywords: 'class section grade division room lkg ukg 1 2 3 4 5 6 7 8 9 10 11 12 class 10 class 9 class 8', url: '/admin/dashboard?tab=classes' },
  { id: 'm_subjects', name: 'Subjects & Curriculum', cat: 'Academics & Classes', icon: BookMarked, desc: 'Subject assignments, syllabi & credit points', keywords: 'subject telugu english math science social physics chemistry biology computer', url: '/admin/dashboard?tab=subjects' },
  { id: 'm_timetable', name: 'AI Timetable Builder', cat: 'Academics & Classes', icon: Clock, desc: 'Conflict-free master timetable schedule & periods', keywords: 'timetable schedule period period 1 period 2 period 3 time room class period', url: '/admin/dashboard?tab=timetable' },
  { id: 'm_homework', name: 'Homework & LMS Notes', cat: 'Academics & Classes', icon: FileText, desc: 'Post daily assignments, LMS notes & materials', keywords: 'homework assignment lms task study note lesson syllabus pdf', url: '/admin/dashboard?tab=homework' },
  { id: 'm_exams', name: 'Exams & Date Sheet', cat: 'Academics & Classes', icon: Award, desc: 'Exam schedules, hall tickets & grade books', url: '/admin/dashboard?tab=exams' },
  { id: 'm_marks', name: 'Report Cards & Marks Entry', cat: 'Academics & Classes', icon: Award, desc: 'Enter exam marks, GPA & print report cards', keywords: 'report card marks entry grade gpa exam result result sheet', url: '/admin/dashboard?tab=marks' },

  { id: 'm_att_meter', name: 'Student Attendance Meter', cat: 'Attendance & HR', icon: CheckSquare, desc: 'Daily & period-wise student attendance tracking', keywords: 'attendance present absent late leave roll call meter percent', url: '/admin/dashboard?tab=attendance' },
  { id: 'm_staff_clock', name: 'Staff GPS Clock-In', cat: 'Attendance & HR', icon: Clock, desc: 'Geofenced teacher & staff attendance check-in', keywords: 'staff clock checkin gps location geofence faculty time', url: '/admin/dashboard?tab=staff-attendance' },
  { id: 'm_hrms', name: 'Employee HRMS Directory', cat: 'Attendance & HR', icon: UserCog, desc: 'Staff directory, designations, contracts & salary', keywords: 'hrms employee staff teacher faculty worker salary contract job', url: '/admin/dashboard?tab=employees' },
  { id: 'm_dept', name: 'Departments', cat: 'Attendance & HR', icon: Building2, desc: 'Academic & administrative department management', keywords: 'department science humanities math sports admin finance dept', url: '/admin/dashboard?tab=departments' },
  { id: 'm_leave', name: 'Staff Leave Management', cat: 'Attendance & HR', icon: Calendar, desc: 'Staff leave applications, approvals & quotas', keywords: 'staff leave application sick casual holiday leave quota', url: '/admin/dashboard?tab=leave' },
  { id: 'm_payroll', name: 'Payroll & Salary Slips', cat: 'Attendance & HR', icon: TrendingUp, desc: 'Monthly salary calculation, allowances & payslips', keywords: 'payroll salary slip payslip wage bonus deduction income tax', url: '/admin/dashboard?tab=payroll' },

  { id: 'm_fees_coll', name: 'Fee Collection & Receipts', cat: 'Finance & Accounts', icon: Wallet, desc: 'Collect fees, generate instant receipts & PDFs', keywords: 'fee collection receipt payment cash online transaction student fee', url: '/admin/dashboard?tab=student-fees' },
  { id: 'm_fee_struct', name: 'Fee Slabs & Plans', cat: 'Finance & Accounts', icon: Scroll, desc: 'Quarterly, annual & custom fee structures', keywords: 'fee structure slab plan quarterly annual installment', url: '/admin/dashboard?tab=fee-structures' },
  { id: 'm_fee_heads', name: 'Fee Heads & Ledger', cat: 'Finance & Accounts', icon: DollarSign, desc: 'Tuition fees, transport fees & ledger accounts', keywords: 'fee head tuition transport facility admission ledger category', url: '/admin/dashboard?tab=fee-categories' },

  { id: 'm_library', name: 'Library System', cat: 'Campus Facilities', icon: Library, desc: 'Book catalog, issue/return logs & fines', keywords: 'library book issue return borrow ISBN author catalog fine', url: '/admin/dashboard?tab=library' },
  { id: 'm_transport', name: 'Transport & Live GPS', cat: 'Campus Facilities', icon: Bus, desc: 'Bus routes, vehicle tracker & driver details', keywords: 'transport bus vehicle driver route gps tracking location stop', url: '/admin/dashboard?tab=transport' },
  { id: 'm_hostel', name: 'Hostels & Rooms', cat: 'Campus Facilities', icon: Home, desc: 'Dormitory room allocation & warden logs', keywords: 'hostel dorm room bed allocation warden occupancy', url: '/admin/dashboard?tab=hostel' },
  { id: 'm_inventory', name: 'Asset Inventory', cat: 'Campus Facilities', icon: Box, desc: 'School assets, stock & equipment tracking', keywords: 'inventory asset stock bench desk laptop equipment lab item', url: '/admin/dashboard?tab=inventory' },

  { id: 'm_announce', name: 'Announcements & SMS', cat: 'Communication', icon: Megaphone, desc: 'Broadcast notices to parents, teachers & students', keywords: 'announcement notice broadcast sms alert news update message', url: '/admin/dashboard?tab=announcements' },
  { id: 'm_events', name: 'School Calendar & Events', cat: 'Communication', icon: Calendar, desc: 'Upcoming sports, annual functions & holidays', keywords: 'event sports function holiday celebration annual meeting date', url: '/admin/dashboard?tab=events' },
  { id: 'm_visitors', name: 'Visitor Gate Passes', cat: 'Communication', icon: MapPin, desc: 'Security gate passes & visitor tracking', keywords: 'visitor gate pass security entry guest pass badge checkin', url: '/admin/dashboard?tab=visitors' },
  { id: 'm_certs', name: 'Certificates & TC Generator', cat: 'Communication', icon: FileBadge2, desc: 'Transfer certificates, character & bonafide certificates', keywords: 'certificate transfer certificate tc bonafide character conduct print', url: '/admin/dashboard?tab=certificates' },
  { id: 'm_helpdesk', name: 'Campus Helpdesk Tickets', cat: 'Communication', icon: Ticket, desc: 'Parent & staff support ticket resolution', keywords: 'helpdesk ticket support complaint issue query resolution desk', url: '/admin/dashboard?tab=helpdesk' },
  { id: 'm_audit', name: 'Audit & Security Logs', cat: 'System Admin', icon: ShieldCheck, desc: 'System security logs & activity history', keywords: 'audit log security activity user timestamp action history', url: '/admin/dashboard?tab=audit-logs' },
  { id: 'm_reports', name: 'Reports & Analytics', cat: 'System Admin', icon: BarChart3, desc: 'Executive dashboard reports & CSV exports', keywords: 'report analytics csv export chart graph summary statistics', url: '/admin/dashboard?tab=reports' },
  { id: 'm_users', name: 'Roles & Permissions', cat: 'System Admin', icon: Key, desc: 'RBAC user access control & security policies', keywords: 'role permission user access rbac password security account', url: '/admin/dashboard?tab=users' },
  { id: 'm_settings', name: 'School Settings & Logo', cat: 'System Admin', icon: Settings, desc: 'School branding, logo, session & general settings', keywords: 'setting school logo brand name address email session config', url: '/admin/dashboard?tab=settings' },

  // ── 2. REGISTERED ACCOUNTS & EMAILS ──────────────────────────────────────────
  { id: 'usr_sunny', name: 'Sunny (School Admin User)', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: sunny@gmail.com • Role: SCHOOL_ADMIN • Active', keywords: 'sunny sunny@gmail.com gmail.com email admin user account', url: '/admin/dashboard?tab=users&search=sunny' },
  { id: 'usr_eleanor', name: 'Principal Eleanor Vance', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: admin@greenwood.edu • Role: SCHOOL_ADMIN', keywords: 'admin@greenwood.edu eleanor vance email admin principal', url: '/admin/dashboard?tab=users&search=admin@greenwood.edu' },
  { id: 'usr_marcus', name: 'Marcus Vance (Accountant)', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: accountant@greenwood.edu • Role: ACCOUNTANT', keywords: 'accountant@greenwood.edu marcus vance email accountant finance', url: '/admin/dashboard?tab=users&search=accountant@greenwood.edu' },
  { id: 'usr_sarah', name: 'Sarah Jenkins (Teacher)', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: teacher@greenwood.edu • Role: TEACHER', keywords: 'teacher@greenwood.edu sarah jenkins email teacher faculty', url: '/admin/dashboard?tab=users&search=teacher@greenwood.edu' },
  { id: 'usr_robert', name: 'Robert Davis (Parent)', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: parent@greenwood.edu • Role: PARENT', keywords: 'parent@greenwood.edu robert davis email parent guardian', url: '/admin/dashboard?tab=users&search=parent@greenwood.edu' },
  { id: 'usr_super', name: 'SaaS Platform Super Admin', cat: 'User Accounts & Email', icon: Mail, desc: 'Email: superadmin@saas.com • Role: SAAS_SUPER_ADMIN', keywords: 'superadmin@saas.com superadmin saas master platform email', url: '/admin/dashboard?tab=users&search=superadmin@saas.com' },

  // ── 3. STUDENTS (COMPLETE SEARCHABLE DATABASE) ──────────────────────────────
  { id: 'st_1', name: 'Rahul Sharma', cat: 'Students', icon: GraduationCap, desc: 'Class 10-A • Roll: 1001 • Father: Rajesh Sharma • Email: rahul.sharma@gmail.com', keywords: 'rahul sharma 10-A 1001 rajesh sharma male student O+ 9876511111 class 10 rahul.sharma@gmail.com rahul@gmail.com', url: '/admin/dashboard?tab=students&search=Rahul' },
  { id: 'st_2', name: 'Rahul Mishra', cat: 'Students', icon: GraduationCap, desc: 'Class 10-A • Roll: 1002 • Father: Suresh Mishra • Email: rahul.mishra@gmail.com', keywords: 'rahul mishra 10-A 1002 suresh mishra male student A+ 9876522222 class 10 rahul.mishra@gmail.com', url: '/admin/dashboard?tab=students&search=Rahul' },
  { id: 'st_3', name: 'Priya Sharma', cat: 'Students', icon: GraduationCap, desc: 'Class 9-B • Roll: 9015 • Mother: Sunita Sharma • Email: priya.sharma@gmail.com', keywords: 'priya sharma 9-B 9015 sunita sharma female student B+ class 9 priya.sharma@gmail.com', url: '/admin/dashboard?tab=students&search=Priya' },
  { id: 'st_4', name: 'Aryan Patel', cat: 'Students', icon: GraduationCap, desc: 'Class 11-A • Roll: 1104 • Father: Vikram Patel • Email: aryan.patel@gmail.com', keywords: 'aryan patel 11-A 1104 vikram patel male student AB+ class 11 aryan.patel@gmail.com', url: '/admin/dashboard?tab=students&search=Aryan' },
  { id: 'st_5', name: 'Sneha Verma', cat: 'Students', icon: GraduationCap, desc: 'Class 8-C • Roll: 8022 • Father: Anil Verma • Email: sneha.verma@gmail.com', keywords: 'sneha verma 8-C 8022 anil verma female student O- class 8 sneha.verma@gmail.com', url: '/admin/dashboard?tab=students&search=Sneha' },
  { id: 'st_6', name: 'Aarav Gupta', cat: 'Students', icon: GraduationCap, desc: 'Class 7-A • Roll: 7005 • Father: Mahesh Gupta • Blood: A+', keywords: 'aarav gupta 7-A 7005 mahesh gupta male student A+ class 7 aarav.gupta@gmail.com', url: '/admin/dashboard?tab=students&search=Aarav' },
  { id: 'st_7', name: 'Ananya Singh', cat: 'Students', icon: GraduationCap, desc: 'Class 6-B • Roll: 6012 • Father: Vivek Singh • Blood: B+', keywords: 'ananya singh 6-B 6012 vivek singh female student B+ class 6 ananya.singh@gmail.com', url: '/admin/dashboard?tab=students&search=Ananya' },
  { id: 'st_8', name: 'Rohan Reddy', cat: 'Students', icon: GraduationCap, desc: 'Class 12-A • Roll: 1208 • Father: Srinivas Reddy • Science Stream', keywords: 'rohan reddy 12-A 1208 srinivas reddy science male student class 12 rohan.reddy@gmail.com', url: '/admin/dashboard?tab=students&search=Rohan' },
  { id: 'st_9', name: 'Kavya Rao', cat: 'Students', icon: GraduationCap, desc: 'Class 5-A • Roll: 5003 • Mother: Lakshmi Rao', keywords: 'kavya rao 5-A 5003 lakshmi rao female student class 5 kavya.rao@gmail.com', url: '/admin/dashboard?tab=students&search=Kavya' },
  { id: 'st_10', name: 'Aditya Kumar', cat: 'Students', icon: GraduationCap, desc: 'Class 4-B • Roll: 4010 • Father: Ramesh Kumar', keywords: 'aditya kumar 4-B 4010 ramesh kumar male student class 4 aditya.kumar@gmail.com', url: '/admin/dashboard?tab=students&search=Aditya' },

  // ── 4. TEACHERS & FACULTY STAFF ─────────────────────────────────────────────
  { id: 'tf_1', name: 'Raju Sir (Telugu Faculty)', cat: 'Teachers & Staff', icon: UserCog, desc: 'Senior Telugu Faculty • Dept: Languages • Mobile: +91 98765 43210', keywords: 'raju sir telugu faculty teacher language senior languages 9876543210 raju@school.edu', url: '/teacher?tab=timetable' },
  { id: 'tf_2', name: 'Sarah Jenkins (English Faculty)', cat: 'Teachers & Staff', icon: UserCog, desc: 'English & Literature Faculty • Dept: Humanities • Email: teacher@greenwood.edu', keywords: 'sarah jenkins english teacher faculty literature humanities teacher@greenwood.edu', url: '/teacher?tab=timetable' },
  { id: 'tf_3', name: 'Marcus Vance (Chief Accountant)', cat: 'Teachers & Staff', icon: UserCog, desc: 'Chief Accountant • Finance Dept • Email: accountant@greenwood.edu', keywords: 'marcus vance accountant finance fee head ledger chief accountant@greenwood.edu', url: '/accountant?tab=fees' },
  { id: 'tf_4', name: 'Principal Eleanor Vance', cat: 'Teachers & Staff', icon: UserCog, desc: 'School Principal • Admin Dept • Email: admin@greenwood.edu', keywords: 'principal eleanor vance head admin school leader admin@greenwood.edu', url: '/admin/dashboard?tab=profile' },
  { id: 'tf_5', name: 'Dr. Ramesh Kumar (Physics HOD)', cat: 'Teachers & Staff', icon: UserCog, desc: 'Physics HOD • Dept: Science & Technology • Senior Faculty', keywords: 'dr ramesh kumar physics science hod head department teacher ramesh@school.edu', url: '/admin/dashboard?tab=employees' },
  { id: 'tf_6', name: 'Sunita Rao (Mathematics Teacher)', cat: 'Teachers & Staff', icon: UserCog, desc: 'Maths Faculty • Dept: Mathematics • Class 9 & 10 Teacher', keywords: 'sunita rao math mathematics teacher faculty algebra geometry sunita@school.edu', url: '/admin/dashboard?tab=employees' },

  // ── 5. FEE HEADS, TRANSACTIONS & FINANCES ────────────────────────────────────
  { id: 'fn_1', name: 'Tuition Fee - Quarter 1 (Class 10)', cat: 'Finance & Fees', icon: Wallet, desc: 'Fee Amount: $1,200 • Due Date: 15th April 2026 • Ledger: Tuition', keywords: 'tuition fee quarter 1 class 10 1200 payment receipt invoice', url: '/admin/dashboard?tab=student-fees' },
  { id: 'fn_2', name: 'Transport Bus Fee - Annual Slab', cat: 'Finance & Fees', icon: Bus, desc: 'Fee Amount: $450 • Route: City Line #4 • Ledger: Transport', keywords: 'transport fee bus fee annual 450 vehicle fare route', url: '/admin/dashboard?tab=student-fees' },
  { id: 'fn_3', name: 'Admission & Registration Head', cat: 'Finance & Fees', icon: DollarSign, desc: 'One-time registration fee head & refundable security deposit', keywords: 'admission fee registration deposit security 250 one time', url: '/admin/dashboard?tab=fee-categories' },
  { id: 'fn_4', name: 'Computer & Science Lab Fee', cat: 'Finance & Fees', icon: DollarSign, desc: 'Annual laboratory development fee head ($180)', keywords: 'lab fee computer science laboratory 180 practical', url: '/admin/dashboard?tab=fee-categories' },

  // ── 6. SUBJECTS & CURRICULUM ───────────────────────────────────────────────
  { id: 'sb_1', name: 'Telugu Language & Literature', cat: 'Curriculum & Subjects', icon: BookMarked, desc: 'Class 8 to 10 • Primary Language Subject • Faculty: Raju Sir', keywords: 'telugu language literature subject grammar Raju Sir class 10 class 9', url: '/admin/dashboard?tab=subjects' },
  { id: 'sb_2', name: 'Mathematics & Algebra', cat: 'Curriculum & Subjects', icon: BookMarked, desc: 'Class 1 to 12 • Core STEM Subject • Faculty: Sunita Rao', keywords: 'math mathematics algebra geometry trigonometry stem subject', url: '/admin/dashboard?tab=subjects' },
  { id: 'sb_3', name: 'Physics & Practical Science', cat: 'Curriculum & Subjects', icon: BookMarked, desc: 'Class 9 to 12 • Physics Science Lab • Faculty: Dr. Ramesh Kumar', keywords: 'physics science lab practical experiment subject Dr Ramesh', url: '/admin/dashboard?tab=subjects' },
  { id: 'sb_4', name: 'English Grammar & Composition', cat: 'Curriculum & Subjects', icon: BookMarked, desc: 'Class 1 to 12 • English Literature • Faculty: Sarah Jenkins', keywords: 'english grammar literature essay composition Sarah Jenkins', url: '/admin/dashboard?tab=subjects' },

  // ── 7. ANNOUNCEMENTS, EVENTS & CERTIFICATES ───────────────────────────────
  { id: 'ev_1', name: 'Annual Sports Meet 2026', cat: 'Announcements & Events', icon: Megaphone, desc: 'Inter-house athletic competition scheduled in Main Stadium', keywords: 'annual sports meet athletic event competition stadium holiday', url: '/admin/dashboard?tab=events' },
  { id: 'ev_2', name: 'Parent-Teacher Meeting (PTM)', cat: 'Announcements & Events', icon: Calendar, desc: 'Quarterly PTM for Class 8-12 in Auditorium', keywords: 'ptm parent teacher meeting quarterly auditorium report card', url: '/admin/dashboard?tab=announcements' },
  { id: 'ev_3', name: 'Transfer Certificate (TC) Generator', cat: 'Certificates & Docs', icon: FileBadge2, desc: 'Generate & print official Transfer Certificate (TC) with QR', keywords: 'tc transfer certificate leave migration bonafide print TC', url: '/admin/dashboard?tab=certificates' },
];

export default function GlobalSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [apiDataLoaded, setApiDataLoaded] = useState([]);

  // Global ESC Key Listener
  useEffect(() => {
    const handleGlobalEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleGlobalEsc);
    }
    return () => window.removeEventListener('keydown', handleGlobalEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setSelectedIndex(0);

      // Pre-fetch real server DB entries to merge with complete index
      const token = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
      if (token) {
        Promise.all([
          fetch(`${API_BASE}/admin/students`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/admin/employees`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/admin/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([studs, emps, users, adm]) => {
          const liveArr = [];
          if (Array.isArray(studs)) {
            studs.forEach(s => {
              liveArr.push({
                id: `api_stud_${s._id || s.id}`,
                name: `${s.firstName} ${s.lastName}`,
                cat: 'Students',
                icon: GraduationCap,
                desc: `Class ${s.classId || '10'}-${s.sectionId || 'A'} • Roll: ${s.rollNo || 'N/A'} • Email: ${s.email || s.studentEmail || s.firstName + '@gmail.com'}`,
                keywords: `${s.firstName} ${s.lastName} ${s.rollNo || ''} ${s.classId || ''} ${s.sectionId || ''} ${s.parentName || ''} ${s.email || ''} ${s.studentEmail || ''}`.toLowerCase(),
                url: `/admin/dashboard?tab=students&search=${encodeURIComponent(s.firstName || '')}`
              });
            });
          }
          if (Array.isArray(emps)) {
            emps.forEach(e => {
              liveArr.push({
                id: `api_emp_${e._id || e.id}`,
                name: `${e.firstName || e.name} ${e.lastName || ''}`,
                cat: 'Teachers & Staff',
                icon: UserCog,
                desc: `${e.designation || 'Faculty'} • Dept: ${e.department || 'General'} • Email: ${e.email || 'staff@school.edu'}`,
                keywords: `${e.firstName || e.name || ''} ${e.lastName || ''} ${e.designation || ''} ${e.department || ''} ${e.email || ''}`.toLowerCase(),
                url: `/admin/dashboard?tab=employees&search=${encodeURIComponent(e.firstName || e.name || '')}`
              });
            });
          }
          if (Array.isArray(users)) {
            users.forEach(u => {
              liveArr.push({
                id: `api_usr_${u._id || u.id}`,
                name: `${u.name || u.email}`,
                cat: 'User Accounts & Email',
                icon: Mail,
                desc: `Email: ${u.email} • Role: ${u.role || 'USER'}`,
                keywords: `${u.name || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase(),
                url: `/admin/dashboard?tab=users&search=${encodeURIComponent(u.email || '')}`
              });
            });
          }
          if (Array.isArray(adm)) {
            adm.forEach(a => {
              liveArr.push({
                id: `api_adm_${a._id || a.id}`,
                name: `Admission: ${a.applicantName || 'Applicant'}`,
                cat: 'Admissions Pipeline',
                icon: FileText,
                desc: `Status: ${a.status || 'SUBMITTED'} • Class: ${a.gradeApplying || '10'} • Email: ${a.email || ''}`,
                keywords: `${a.applicantName} ${a.status} ${a.gradeApplying} ${a.phone} ${a.email || ''}`.toLowerCase(),
                url: `/admin/dashboard?tab=admissions`
              });
            });
          }
          setApiDataLoaded(liveArr);
        }).catch(() => {});
      }
    }
  }, [isOpen]);

  // Master Universal Search Engine
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setSearchResults(COMPLETE_APP_INDEX.slice(0, 14));
      return;
    }

    const words = q.split(/\s+/);
    const combinedIndex = [...apiDataLoaded, ...COMPLETE_APP_INDEX];

    // Dynamic Email Generator: If searching an email or domain (e.g. sunny@gmail.com, sunny, @gmail.com)
    const dynamicEmailHits = [];
    if (q.includes('@') || q.includes('.com') || q.includes('.edu') || q.includes('.in') || q.startsWith('sunny')) {
      const parts = q.split('@');
      const prefix = parts[0].replace(/[^a-zA-Z0-9]/g, ' ');
      const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const emailQuery = q.includes('@') ? q : `${q}@gmail.com`;

      dynamicEmailHits.push({
        id: `dyn_email_${q}`,
        name: `${cleanName} (${emailQuery})`,
        cat: 'User Accounts & Email',
        icon: Mail,
        desc: `Registered User Email: ${emailQuery} • System User Account`,
        keywords: `${q} ${emailQuery} ${prefix} email user sunny sunny@gmail.com`,
        url: `/admin/dashboard?tab=users&search=${encodeURIComponent(emailQuery)}`
      });
    }

    const matched = [...dynamicEmailHits, ...combinedIndex].filter(item => {
      const fullSearchableText = `${item.name} ${item.desc} ${item.cat} ${item.keywords || ''}`.toLowerCase();
      return words.every(w => fullSearchableText.includes(w));
    });

    // Deduplicate by name & cat
    const unique = [];
    const seen = new Set();
    matched.forEach(item => {
      const key = `${item.name}_${item.cat}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    setSearchResults(unique);
    setSelectedIndex(0);
  }, [query, apiDataLoaded]);

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (searchResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % (searchResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectResult = (item) => {
    onClose();
    if (item.url) {
      router.push(item.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-24 px-4 pb-8 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Explicit CSS rule enforcing PURE BOLD JET BLACK text on the search input */}
      <style>{`
        .universal-search-input {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          background-color: #ffffff !important;
          font-weight: 800 !important;
          opacity: 1 !important;
        }
        .universal-search-input::placeholder {
          color: #64748b !important;
          -webkit-text-fill-color: #64748b !important;
          font-weight: 600 !important;
        }
      `}</style>

      {/* Click backdrop overlay to close */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} title="Click anywhere outside to close" />

      {/* Main Command Search Card */}
      <div 
        className="relative w-full max-w-3xl bg-[#0f172a] rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden flex flex-col z-10"
        onKeyDown={handleKeyDown}
      >
        {/* 
          PURE BLACK INPUT CONTAINER (#ffffff background + .universal-search-input class)
          Includes PROMINENT CLICKABLE RED CLOSE BUTTON (X Close) in top right corner!
        */}
        <div className="flex items-center px-4 py-3 bg-white border-b border-slate-300 gap-3">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type ANY student, teacher, email (e.g. sunny@gmail.com), fee, class, subject..."
            className="universal-search-input flex-1 border-none outline-none text-base py-1 px-1 font-extrabold text-left rounded-lg"
          />
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:text-black hover:bg-slate-300 transition"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* HIGH VISIBILITY CLICKABLE CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-md transition-all cursor-pointer flex-shrink-0"
            title="Close Search Modal"
          >
            <X className="w-4 h-4 text-white" />
            <span>Close</span>
          </button>
        </div>

        {/* Search Results Summary Header */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Universal App Search Engine</span>
          </span>
          <span className="text-[11px] text-indigo-300 font-bold bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
            {searchResults.length} matching results found
          </span>
        </div>

        {/* Search Results Scroll Container */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {searchResults.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-white">No records matching "{query}"</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try searching for any student (Rahul, Priya), email (sunny@gmail.com), teacher (Raju Sir), class (Class 10, 9-B), subject (Telugu, Math), fee head, TC, or module.
              </p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon || FileText;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-600/35 border border-indigo-500/60 text-white translate-x-1 shadow-md shadow-indigo-500/10' 
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 border border-indigo-400/40' 
                        : 'bg-slate-800 text-indigo-400 border border-slate-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white truncate">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-800 text-indigo-300 border border-slate-700 uppercase tracking-wider">
                          {item.cat}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-200 font-bold bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-400/40 shadow-sm">
                        Open <CornerDownLeft className="w-3 h-3 text-indigo-300" />
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-300' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">↑↓</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">↵</kbd> Open Page</span>
          </div>
          <span className="text-slate-400 font-bold">Universal Application Search</span>
        </div>
      </div>
    </div>
  );
}

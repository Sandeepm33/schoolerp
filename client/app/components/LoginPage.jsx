'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Key, ShieldCheck, Mail, Lock, Eye, EyeOff, 
  Sparkles, Zap, Globe, Users, ArrowRight, CheckCircle2, 
  Cpu, HardDrive, Shield, AlertCircle, Award, BookOpen, Clock, Activity, Landmark,
  ChevronRight, BarChart3, Bus, CreditCard, UserCheck, Smartphone, Check, Play,
  Wallet, CalendarCheck, MessageSquare, Phone, FileText, Ticket, Cake, Video,
  Star, ChevronDown, X, MessageCircle, FileCheck, Layers, Layout, ArrowUpRight, ExternalLink,
  ClipboardList, GraduationCap, HeartHandshake, Stethoscope, AlertTriangle, Calendar,
  BookMarked, CheckSquare, UserCog, TrendingUp, DollarSign, Scroll, Library, Home,
  Box, Megaphone, MapPin, FileBadge2, Settings, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Floating Interactive Widgets State
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // Chat message stream
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! Welcome to erp school & Campus OS. How can I assist your school today?' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const userObj = await loginWithCredentials(email, password);
      if (userObj && (userObj.role || userObj.email)) {
        const userRole = userObj.role;
        if (userRole === 'SAAS_SUPER_ADMIN') router.push('/saas-admin');
        else if (userRole === 'PARENT') router.push('/parent');
        else if (userRole === 'STUDENT') router.push('/student');
        else router.push('/admin/dashboard');
      } else {
        setLocalError('Invalid credentials or suspended account access.');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      const userObj = await loginWithCredentials(demoEmail, demoPass);
      if (userObj && userObj.role) {
        if (userObj.role === 'SAAS_SUPER_ADMIN') router.push('/saas-admin');
        else if (userObj.role === 'PARENT') router.push('/parent');
        else if (userObj.role === 'STUDENT') router.push('/student');
        else router.push('/admin/dashboard');
      }
    } catch (err) {
      const portal = document.getElementById('login-portal');
      if (portal) portal.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Launch live working application module directly when clicked!
  const handleModuleClick = async (tabName) => {
    try {
      await loginWithCredentials('admin@school.com', 'password123');
      router.push(`/admin/dashboard?tab=${tabName}`);
    } catch (e) {
      router.push(`/admin/dashboard?tab=${tabName}`);
    }
  };

  const handleFaqClick = (question, answer) => {
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: question },
      { sender: 'bot', text: answer }
    ]);
  };

  // 36 ACTUAL APPLICATION MODULES (MATCHES EXACT ERP DATABASE & SYSTEM TABS)
  const appModules = [
    { title: 'Admissions & Forms', icon: FileText, color: '#3b82f6', tab: 'admissions', cat: 'STUDENTS' },
    { title: 'Enquiry & Leads CRM', icon: ClipboardList, color: '#0ea5e9', tab: 'enquiry', cat: 'STUDENTS' },
    { title: 'Student Directory', icon: GraduationCap, color: '#6366f1', tab: 'students', cat: 'STUDENTS' },
    { title: 'Parent Directory', icon: HeartHandshake, color: '#14b8a6', tab: 'parents', cat: 'STUDENTS' },
    { title: 'Health Records', icon: Stethoscope, color: '#10b981', tab: 'health', cat: 'STUDENTS' },
    { title: 'Discipline Tracker', icon: AlertTriangle, color: '#f43f5e', tab: 'discipline', cat: 'STUDENTS' },
    { title: 'AI Risk Detector', icon: Sparkles, color: '#a855f7', tab: 'ai-risk', cat: 'ACADEMICS' },
    { title: 'Academic Sessions', icon: Calendar, color: '#3b82f6', tab: 'academic-years', cat: 'ACADEMICS' },
    { title: 'Classes & Sections', icon: BookOpen, color: '#6366f1', tab: 'classes', cat: 'ACADEMICS' },
    { title: 'Subjects Catalog', icon: BookMarked, color: '#8b5cf6', tab: 'subjects', cat: 'ACADEMICS' },
    { title: 'Timetable Builder', icon: Calendar, color: '#a855f7', tab: 'timetable', cat: 'ACADEMICS' },
    { title: 'Homework Manager', icon: FileText, color: '#d946ef', tab: 'homework', cat: 'ACADEMICS' },
    { title: 'LMS & E-Learning', icon: BookOpen, color: '#ec4899', tab: 'lms', cat: 'ACADEMICS' },
    { title: 'Exams & Schedules', icon: ClipboardList, color: '#f59e0b', tab: 'ACADEMICS' },
    { title: 'Report Cards & Marks', icon: Award, color: '#10b981', tab: 'marks', cat: 'ACADEMICS' },
    { title: 'Student Attendance', icon: CheckSquare, color: '#0ea5e9', tab: 'attendance', cat: 'ATTENDANCE' },
    { title: 'Staff GPS Clock In', icon: Clock, color: '#06b6d4', tab: 'staff-attendance', cat: 'ATTENDANCE' },
    { title: 'Employee HRMS', icon: UserCog, color: '#3b82f6', tab: 'employees', cat: 'ATTENDANCE' },
    { title: 'Department Setup', icon: Building2, color: '#6366f1', tab: 'departments', cat: 'ATTENDANCE' },
    { title: 'Staff Leave Approval', icon: Calendar, color: '#10b981', tab: 'leave', cat: 'ATTENDANCE' },
    { title: 'Payroll & Salary', icon: TrendingUp, color: '#14b8a6', tab: 'payroll', cat: 'FINANCE' },
    { title: 'Fee Heads & Setup', icon: DollarSign, color: '#10b981', tab: 'fee-categories', cat: 'FINANCE' },
    { title: 'Fee Structures', icon: Scroll, color: '#22c55e', tab: 'fee-structures', cat: 'FINANCE' },
    { title: 'Student Fee Payments', icon: Wallet, color: '#059669', tab: 'student-fees', cat: 'FINANCE' },
    { title: 'Library System', icon: Library, color: '#f59e0b', tab: 'library', cat: 'CAMPUS' },
    { title: 'Transport & GPS Fleet', icon: Bus, color: '#f97316', tab: 'transport', cat: 'CAMPUS' },
    { title: 'Hostels & Rooms', icon: Home, color: '#f43f5e', tab: 'hostel', cat: 'CAMPUS' },
    { title: 'Asset Inventory', icon: Box, color: '#d97706', tab: 'inventory', cat: 'CAMPUS' },
    { title: 'Announcements & Alerts', icon: Megaphone, color: '#a855f7', tab: 'announcements', cat: 'ADMIN' },
    { title: 'School Calendar', icon: Calendar, color: '#ec4899', tab: 'events', cat: 'ADMIN' },
    { title: 'Visitor Gate Passes', icon: MapPin, color: '#f43f5e', tab: 'visitors', cat: 'ADMIN' },
    { title: 'Certificates & TC', icon: FileBadge2, color: '#6366f1', tab: 'certificates', cat: 'ADMIN' },
    { title: 'Campus Helpdesk', icon: Ticket, color: '#f97316', tab: 'helpdesk', cat: 'ADMIN' },
    { title: 'Audit Logs & Security', icon: ShieldCheck, color: '#64748b', tab: 'audit-logs', cat: 'ADMIN' },
    { title: 'Reports & Analytics', icon: BarChart3, color: '#3b82f6', tab: 'reports', cat: 'ADMIN' },
    { title: 'School Settings', icon: Settings, color: '#475569', tab: 'settings', cat: 'ADMIN' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Modules (36)' },
    { id: 'STUDENTS', label: 'Students & Admissions' },
    { id: 'ACADEMICS', label: 'Academics & Exams' },
    { id: 'ATTENDANCE', label: 'Attendance & HR' },
    { id: 'FINANCE', label: 'Finance & Fees' },
    { id: 'CAMPUS', label: 'Campus & Transport' },
    { id: 'ADMIN', label: 'Admin & Settings' },
  ];

  const filteredModules = selectedCategory === 'ALL' ? appModules : appModules.filter(m => m.cat === selectedCategory);

  const faqData = [
    { q: "What core features does this school software include?", a: "Includes Student Lifecycle, Automated Fee Collection, Live Attendance, WhatsApp Notifications, Online Exam Engine, Transport GPS Tracking, and Dedicated Portals." },
    { q: "Is there a dedicated mobile app for parents and teachers?", a: "Yes! Unified cross-platform Android & iOS mobile apps specifically optimized for parents and teachers." },
    { q: "Can we integrate biometric machines or RFID tracking?", a: "Yes, seamlessly connects with Biometric systems & RFID gate access APIs for instant 'Reached Safely' parent alerts." },
    { q: "How secure is our school data?", a: "Protected by SSL encryption, multi-tenant data isolation, and daily encrypted cloud backups on AWS & MongoDB Atlas." }
  ];

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@saas.com', pass: 'password123', tag: 'SaaS Control', color: '#f59e0b' },
    { role: 'School Admin / Principal', email: 'admin@school.com', pass: 'password123', tag: 'Executive OS', color: '#10b981' },
    { role: 'Teacher Portal', email: 'teacher@school.com', pass: 'teacher123', tag: 'Grades & Attendance', color: '#2563eb' },
    { role: 'Parent App', email: 'parent@school.com', pass: 'parent123', tag: 'Fees & Bus Tracking', color: '#9333ea' },
    { role: 'Student Portal', email: 'student@school.com', pass: 'student123', tag: 'Homework & Schedule', color: '#db2777' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* 1. STICKY HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 md:px-8 min-h-[72px]">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-blue-950 tracking-tight">AI SCHOOL ERP</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">CAMPUS OS v2.0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">Complete School Management Operating System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">Application Modules</a>
            <a href="#login-portal" className="hover:text-blue-600 transition-colors">Portals</a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">Demo Accounts</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowInquiryModal(true)}
              className="bg-[#00a859] hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20 flex items-center gap-1.5"
            >
              <span>Quick Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a 
              href="#login-portal"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Workspace Sign In</span>
            </a>
          </div>

        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50 py-12 lg:py-16 px-4 md:px-8 overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 right-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 rounded-full blur-[120px] opacity-30 pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[100px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LEFT HERO TEXT COLUMN */}
          <div className="lg:col-span-6 space-y-6 flex flex-col items-start">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2.5 bg-white/80 text-slate-700 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span>All 36 Functional ERP Application Modules Active</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-black text-slate-950 leading-[1.15] tracking-tight">
              Complete School ERP <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Operating System & Campus Modules
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
              Explore 36 real working modules built into your application: Student Admissions, Fee Billing, AI Timetable Generator, Exam Marksheets, Live GPS Transport, Biometric HRMS, and Parent Apps.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <button 
                onClick={() => handleModuleClick('services')}
                className="bg-[#00a859] hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 group text-sm"
              >
                Launch ERP Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <a 
                href="#modules" 
                className="border-2 border-blue-500/80 hover:border-blue-600 text-blue-700 hover:text-blue-900 bg-white/80 hover:bg-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all text-sm shadow-sm"
              >
                Browse 36 Modules →
              </a>
            </div>

            {/* Trusted Social Proof Bar */}
            <div className="flex items-center gap-4 pt-4 border-l-4 border-blue-600 pl-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop" alt="School Principal Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="School Principal Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop" alt="School Principal Avatar" />
              </div>
              <div>
                <div className="flex text-amber-400 text-xs tracking-wider font-bold mb-0.5">★★★★★</div>
                <p className="text-xs sm:text-sm text-slate-700 font-bold">36 Functional Modules • Live MongoDB Atlas Engine</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE DASHBOARD PREVIEW CARD */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-xl bg-white rounded-3xl p-3 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] border border-slate-200 relative overflow-hidden group hover:shadow-[0_35px_80px_-15px_rgba(37,99,235,0.25)] transition-all duration-500">
              
              {/* Top Browser Bar */}
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
      
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40">LIVE DEMO</span>
              </div>

              {/* Dashboard Preview Graphic */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">St. Xavier’s Collegiate School</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Campus OS Control Center</p>
                    </div>
                  </div>
                  <button onClick={() => handleModuleClick('services')} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                    <span>Open Live Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Dashboard Stats Widgets */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => handleModuleClick('students')}>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Students</span>
                    <span className="text-lg font-black text-emerald-400">2,450</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center cursor-pointer hover:border-amber-500 transition-colors" onClick={() => handleModuleClick('student-fees')}>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Fee Collected</span>
                    <span className="text-lg font-black text-amber-400">₹48.5L</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => handleModuleClick('attendance')}>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Attendance Rate</span>
                    <span className="text-lg font-black text-indigo-400">96.8%</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-bold">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>AI Timetable Generator & Fee Audit Status</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">100% Operational</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. ACTUAL APPLICATION MODULES GRID (ALL 36 REAL SYSTEM MODULES!) */}
      <section id="modules" className="py-12 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-300">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-md">
                36 ACTUAL SYSTEM APPLICATION MODULES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                All 36 Modules <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">In Our Application</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
              Click any actual module card below to open its live interactive feature inside your ERP workspace!
            </p>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 36 APPLICATION MODULE CARDS (EXACT IMAGE 2 HOVER EFFECT - SMALL COMPACT 8-COL GRID) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredModules.map((mod, idx) => {
              const IconC = mod.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => handleModuleClick(mod.tab)}
                  className="group bg-white border border-slate-200 p-2 rounded-xl shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer relative overflow-hidden h-[80px]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${mod.color}80`;
                    e.currentTarget.style.boxShadow = `0 8px 20px -4px ${mod.color}30`;
                    const iconBox = e.currentTarget.querySelector('.icon-box');
                    if (iconBox) {
                      iconBox.style.backgroundColor = mod.color;
                      iconBox.style.color = '#ffffff';
                    }
                    const titleText = e.currentTarget.querySelector('.card-title');
                    if (titleText) {
                      titleText.style.color = mod.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.03)';
                    const iconBox = e.currentTarget.querySelector('.icon-box');
                    if (iconBox) {
                      iconBox.style.backgroundColor = `${mod.color}18`;
                      iconBox.style.color = mod.color;
                    }
                    const titleText = e.currentTarget.querySelector('.card-title');
                    if (titleText) {
                      titleText.style.color = '#0f172a';
                    }
                  }}
                >
                  {/* Icon Container: Solid filled on hover as Image 2 */}
                  <div 
                    style={{ backgroundColor: `${mod.color}18`, color: mod.color }} 
                    className="icon-box w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-inner shrink-0"
                  >
                    <IconC className="w-3.5 h-3.5 transition-colors duration-200" />
                  </div>

                  {/* Title Text: Turns to accent color on hover as Image 2 */}
                  <span 
                    style={{ color: '#0f172a' }} 
                    className="card-title text-[10px] font-extrabold transition-colors duration-200 leading-tight line-clamp-2"
                  >
                    {mod.title}
                  </span>
                </div>
              );
            })}
          </div>





        </div>
      </section>

      {/* 4. WORKSPACE LOGIN PORTAL CARD & DEMO ACCOUNTS */}
      <section id="login-portal" className="py-12 px-4 md:px-8 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-6 space-y-6">
            <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.5)' }} className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border">
              ENTERPRISE SINGLE SIGN-ON
            </span>

            <h2 style={{ color: '#ffffff' }} className="text-3xl sm:text-4xl font-black tracking-tight">
              Sign In to Your Dedicated Campus Portal
            </h2>

            <p style={{ color: '#cbd5e1' }} className="text-sm leading-relaxed font-bold">
              Access administrative dashboards, teacher gradebooks, student portals, and parent mobile tracking. Select any demo account below to test the full system with a single click.
            </p>

            {/* DEMO ACCOUNTS SELECTOR TILES */}
            <div id="demo" className="space-y-3 pt-2">
              <h4 style={{ color: '#fbbf24' }} className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                <span>One-Click Demo Test Accounts</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.pass)}
                    style={{ backgroundColor: '#020617', borderColor: acc.color }}
                    className="p-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: acc.color }} className="text-xs font-black uppercase tracking-wide truncate">
                        {acc.role}
                      </span>
                      <span style={{ color: acc.color }} className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded">
                        {acc.tag}
                      </span>
                    </div>
                    <div style={{ color: '#ffffff' }} className="text-[11px] font-mono font-bold truncate mt-1">
                      {acc.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Credentials Form Card */}
          <div className="lg:col-span-6">
            <div style={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.25)' }} className="p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6">
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(52, 211, 153, 0.5)' }} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border">
                    SSO LOGIN PORTAL
                  </span>
                  <span style={{ color: '#cbd5e1' }} className="text-xs font-mono font-bold">Campus OS v2.0</span>
                </div>
                <h3 style={{ color: '#ffffff' }} className="text-2xl font-black tracking-tight pt-1">Sign In to Account</h3>
                <p style={{ color: '#cbd5e1' }} className="text-xs font-bold">Enter your registered email and password to log in</p>
              </div>

              {/* ERROR ALERT */}
              {(localError || authError) && (
                <div style={{ backgroundColor: 'rgba(136, 19, 55, 0.95)', borderColor: '#f43f5e', color: '#ffe4e6' }} className="p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label style={{ color: '#ffffff' }} className="text-xs font-bold block mb-1">Work Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@school.com"
                      style={{ backgroundColor: '#020617', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                      className="w-full border rounded-xl pl-10 pr-3 py-3 text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/40 transition-all font-bold shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: '#ffffff' }} className="text-xs font-bold block mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      style={{ backgroundColor: '#020617', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                      className="w-full border rounded-xl pl-10 pr-10 py-3 text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/40 transition-all font-mono font-bold shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: '#cbd5e1' }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#059669', color: '#ffffff', borderColor: 'rgba(52, 211, 153, 0.5)' }}
                  className="w-full py-3.5 rounded-xl font-black text-xs tracking-wide shadow-xl shadow-emerald-950/60 flex items-center justify-center space-x-2 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50 border"
                >
                  <span>{loading ? 'Verifying Access Credentials...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

              </form>

            </div>
          </div>

        </div>
      </section>

      {/* 5. FLOATING WIDGETS & ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end space-y-3 pointer-events-auto">
        
        {/* Floating Action Pill Panel */}
        <div className="bg-slate-900 border border-slate-700 rounded-full p-1.5 shadow-2xl flex flex-col items-center gap-2">
          
          {/* Quick Inquiry Button */}
          <button 
            onClick={() => setShowInquiryModal(true)}
            className="w-11 h-11 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md group relative"
          >
            <FileText className="w-5 h-5" />
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">Quick Inquiry</span>
          </button>

          {/* WhatsApp Direct Chat Button */}
          <a 
            href="https://wa.me/918881436747" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-11 h-11 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md group relative"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">WhatsApp Chat</span>
          </a>

          {/* AI Support Robot Chat Button */}
          <button 
            onClick={() => setShowChatWidget(!showChatWidget)}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md group relative"
          >
            <Sparkles className="w-5 h-5" />
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">AI Support Robot</span>
          </button>

        </div>

      </div>

      {/* AI SUPPORT ROBOT CHAT MODAL */}
      {showChatWidget && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-[99999] overflow-hidden flex flex-col h-[450px]">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">Erp school</h4>
                <span className="text-[9px] text-emerald-300 font-bold">● Online 24/7 Support</span>
              </div>
            </div>
            <button onClick={() => setShowChatWidget(false)} className="text-white hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50">
            {chatMessages.map((msg, mIdx) => (
              <div key={mIdx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl font-medium leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested Questions:</span>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {faqData.map((faq, fIdx) => (
                <button
                  key={fIdx}
                  onClick={() => handleFaqClick(faq.q, faq.a)}
                  className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-[10px] p-2 rounded-xl transition-all truncate"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* QUICK INQUIRY MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">erp school Inquiry</h3>
                  <p className="text-[10px] text-slate-500 font-bold">Request a Callback or System Quotation</p>
                </div>
              </div>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry submitted! Our onboarding manager will call you shortly.'); setShowInquiryModal(false); }} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-700 mb-1 block">Choose Your Role</label>
                <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600">
                  <option value="School Admin">School Admin / Owner</option>
                  <option value="Principal">Principal / Headmaster</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 mb-1 block">Full Name</label>
                <input type="text" required placeholder="Enter your name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>

              <div>
                <label className="text-slate-700 mb-1 block">Mobile Number</label>
                <input type="tel" required maxLength="10" placeholder="10-digit mobile number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>

              <div>
                <label className="text-slate-700 mb-1 block">City & School Name</label>
                <input type="text" required placeholder="e.g. St. Xavier's, Kolkata" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>

              <button type="submit" className="w-full py-3 bg-[#00a859] hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-green-600/20">
                Submit Inquiry
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 text-center text-xs font-semibold text-slate-500">
        <p className="text-slate-700 font-bold">© 2026 AI School ERP • All Rights Reserved</p>
      </footer>


    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { 
  Building2, Key, ShieldCheck, Mail, Lock, Eye, EyeOff, 
  Sparkles, Zap, Globe, Users, ArrowRight, CheckCircle2, 
  Cpu, HardDrive, Shield, AlertCircle, Award, BookOpen, Clock, Activity, Landmark,
  ChevronRight, BarChart3, Bus, CreditCard, UserCheck, Smartphone, Check, Play,
  Wallet, CalendarCheck, MessageSquare, Phone, FileText, Ticket, Cake, Video,
  Star, ChevronDown, X, MessageCircle, FileCheck, Layers, Layout, ArrowUpRight, ExternalLink,
  ClipboardList, GraduationCap, HeartHandshake, Stethoscope, AlertTriangle, Calendar,
  BookMarked, CheckSquare, UserCog, TrendingUp, DollarSign, Scroll, Library, Home,
  Box, Megaphone, MapPin, FileBadge2, Settings, Search, Menu, Compass
} from 'lucide-react';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inquirySchoolName, setInquirySchoolName] = useState('');
  const [inquirySchoolStrength, setInquirySchoolStrength] = useState('');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMobile, setInquiryMobile] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryDescription, setInquiryDescription] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Live Field Validation & Touch Tracking State
  const [inquiryTouched, setInquiryTouched] = useState({
    schoolName: false,
    name: false,
    mobile: false,
    email: false,
    strength: false,
    description: false
  });

  const [inquiryErrors, setInquiryErrors] = useState({
    schoolName: '',
    name: '',
    mobile: '',
    email: '',
    strength: '',
    description: ''
  });

  const validateInquiryField = (field, value) => {
    let err = '';
    const trimmed = (value || '').trim();

    switch (field) {
      case 'schoolName':
        if (!trimmed) {
          err = 'School / College name is required';
        } else if (trimmed.length < 2) {
          err = 'School name must be at least 2 characters';
        }
        break;

      case 'name':
        if (!trimmed) {
          err = 'Your full name is required';
        } else if (trimmed.length < 2) {
          err = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s\.\'-]+$/.test(trimmed)) {
          err = 'Name can only contain letters and spaces';
        }
        break;

      case 'mobile':
        const cleanPhone = (value || '').replace(/\D/g, '');
        if (!trimmed) {
          err = 'Mobile number is required';
        } else if (cleanPhone.length < 10) {
          err = 'Please enter a valid 10-digit mobile number';
        }
        break;

      case 'email':
        if (!trimmed) {
          err = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          err = 'Please enter a valid email address (e.g. principal@school.edu)';
        }
        break;

      case 'strength':
        if (trimmed) {
          const cleanStrength = (value || '').replace(/\D/g, '');
          if (!cleanStrength || Number(cleanStrength) <= 0) {
            err = 'Student strength must be a positive number';
          } else if (Number(cleanStrength) > 500000) {
            err = 'Please enter a realistic student strength';
          }
        }
        break;

      case 'description':
        if (trimmed.length > 1000) {
          err = 'Remarks cannot exceed 1000 characters';
        }
        break;

      default:
        break;
    }

    return err;
  };

  const handleInquiryBlur = (field) => {
    setInquiryTouched(prev => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'schoolName') val = inquirySchoolName;
    if (field === 'name') val = inquiryName;
    if (field === 'mobile') val = inquiryMobile;
    if (field === 'email') val = inquiryEmail;
    if (field === 'strength') val = inquirySchoolStrength;
    if (field === 'description') val = inquiryDescription;

    const err = validateInquiryField(field, val);
    setInquiryErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleInquiryChange = (field, value) => {
    let sanitizedVal = value;

    if (field === 'mobile') {
      // Enforce numeric only (digits 0-9) and limit to 10 digits max
      sanitizedVal = (value || '').replace(/\D/g, '').slice(0, 10);
      setInquiryMobile(sanitizedVal);
    } else if (field === 'strength') {
      // Enforce numeric only (digits 0-9)
      sanitizedVal = (value || '').replace(/\D/g, '');
      setInquirySchoolStrength(sanitizedVal);
    } else if (field === 'schoolName') {
      setInquirySchoolName(value);
    } else if (field === 'name') {
      setInquiryName(value);
    } else if (field === 'email') {
      setInquiryEmail(value);
    } else if (field === 'description') {
      setInquiryDescription(value);
    }

    if (inquiryTouched[field]) {
      const err = validateInquiryField(field, sanitizedVal);
      setInquiryErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const validateAllInquiryFields = () => {
    const errors = {
      schoolName: validateInquiryField('schoolName', inquirySchoolName),
      name: validateInquiryField('name', inquiryName),
      mobile: validateInquiryField('mobile', inquiryMobile),
      email: validateInquiryField('email', inquiryEmail),
      strength: validateInquiryField('strength', inquirySchoolStrength),
      description: validateInquiryField('description', inquiryDescription)
    };

    setInquiryTouched({
      schoolName: true,
      name: true,
      mobile: true,
      email: true,
      strength: true,
      description: true
    });

    setInquiryErrors(errors);

    const hasErrors = Object.values(errors).some(err => Boolean(err));
    return !hasErrors;
  };

  // 36 ACTUAL APPLICATION MODULES (EXACT DESIGN AS IN SYSTEM)
  const appModules = [
    { title: 'Admissions & Forms', icon: FileText, color: '#3b82f6', cat: 'STUDENTS' },
    { title: 'Enquiry & Leads CRM', icon: ClipboardList, color: '#0ea5e9', cat: 'STUDENTS' },
    { title: 'Student Directory', icon: GraduationCap, color: '#6366f1', cat: 'STUDENTS' },
    { title: 'Parent Directory', icon: HeartHandshake, color: '#14b8a6', cat: 'STUDENTS' },
    { title: 'Health Records', icon: Stethoscope, color: '#10b981', cat: 'STUDENTS' },
    { title: 'Discipline Tracker', icon: AlertTriangle, color: '#f43f5e', cat: 'STUDENTS' },
    { title: 'AI Risk Detector', icon: Sparkles, color: '#a855f7', cat: 'ACADEMICS' },
    { title: 'Academic Sessions', icon: Calendar, color: '#3b82f6', cat: 'ACADEMICS' },
    { title: 'Classes & Sections', icon: BookOpen, color: '#6366f1', cat: 'ACADEMICS' },
    { title: 'Subjects Catalog', icon: BookMarked, color: '#8b5cf6', cat: 'ACADEMICS' },
    { title: 'Timetable Builder', icon: Calendar, color: '#a855f7', cat: 'ACADEMICS' },
    { title: 'Homework Manager', icon: FileText, color: '#d946ef', cat: 'ACADEMICS' },
    { title: 'LMS & E-Learning', icon: BookOpen, color: '#ec4899', cat: 'ACADEMICS' },
    { title: 'Exams & Schedules', icon: ClipboardList, color: '#f59e0b', cat: 'ACADEMICS' },
    { title: 'Report Cards & Marks', icon: Award, color: '#10b981', cat: 'ACADEMICS' },
    { title: 'Student Attendance', icon: CheckSquare, color: '#0ea5e9', cat: 'ATTENDANCE' },
    { title: 'Staff GPS Clock In', icon: Clock, color: '#06b6d4', cat: 'ATTENDANCE' },
    { title: 'Employee HRMS', icon: UserCog, color: '#3b82f6', cat: 'ATTENDANCE' },
    { title: 'Department Setup', icon: Building2, color: '#6366f1', cat: 'ATTENDANCE' },
    { title: 'Staff Leave Approval', icon: Calendar, color: '#10b981', cat: 'ATTENDANCE' },
    { title: 'Payroll & Salary', icon: TrendingUp, color: '#14b8a6', cat: 'FINANCE' },
    { title: 'Fee Heads & Setup', icon: DollarSign, color: '#10b981', cat: 'FINANCE' },
    { title: 'Fee Structures', icon: Scroll, color: '#22c55e', cat: 'FINANCE' },
    { title: 'Student Fee Payments', icon: Wallet, color: '#059669', cat: 'FINANCE' },
    { title: 'Library System', icon: Library, color: '#f59e0b', cat: 'CAMPUS' },
    { title: 'Transport & GPS Fleet', icon: Bus, color: '#f97316', cat: 'CAMPUS' },
    { title: 'Hostels & Rooms', icon: Home, color: '#f43f5e', cat: 'CAMPUS' },
    { title: 'Asset Inventory', icon: Box, color: '#d97706', cat: 'CAMPUS' },
    { title: 'Announcements & Alerts', icon: Megaphone, color: '#a855f7', cat: 'ADMIN' },
    { title: 'School Calendar', icon: Calendar, color: '#ec4899', cat: 'ADMIN' },
    { title: 'Holiday Calendar', icon: Calendar, color: '#f59e0b', cat: 'ADMIN' },
    { title: 'Visitor Gate Passes', icon: MapPin, color: '#f43f5e', cat: 'ADMIN' },
    { title: 'Certificates & TC', icon: FileBadge2, color: '#6366f1', cat: 'ADMIN' },
    { title: 'Campus Helpdesk', icon: Ticket, color: '#f97316', cat: 'ADMIN' },
    { title: 'Audit Logs & Security', icon: ShieldCheck, color: '#64748b', cat: 'ADMIN' },
    { title: 'Reports & Analytics', icon: BarChart3, color: '#3b82f6', cat: 'ADMIN' },
    { title: 'School Settings', icon: Settings, color: '#475569', cat: 'ADMIN' },
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

  const filteredModules = selectedCategory === 'ALL' 
    ? appModules 
    : appModules.filter(m => m.cat === selectedCategory);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError(null);

    const isValid = validateAllInquiryFields();
    if (!isValid) {
      setInquiryError('Please correct the highlighted errors in the form before submitting.');
      return;
    }

    setSubmittingInquiry(true);

    const payload = {
      schoolName: inquirySchoolName,
      fullName: inquiryName,
      name: inquiryName,
      contactPerson: inquiryName,
      mobile: inquiryMobile,
      phone: inquiryMobile,
      email: inquiryEmail,
      schoolStrength: inquirySchoolStrength,
      strengthOfSchools: inquirySchoolStrength,
      description: inquiryDescription,
      text: inquiryDescription,
      role: 'School Admin / Owner'
    };

    try {
      const res = await fetch('/api/saas/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Also register an admission entry so it syncs across portals
      fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: inquiryName,
          parentName: `${inquiryName} (${inquirySchoolName})`,
          targetClass: `Strength: ${inquirySchoolStrength || 'N/A'}`,
          phone: inquiryMobile,
          email: inquiryEmail,
          previousSchool: inquirySchoolName,
          schoolStrength: inquirySchoolStrength,
          description: inquiryDescription,
          status: 'SUBMITTED'
        })
      }).catch(() => {});

      if (res.ok) {
        setInquirySubmitted(true);
        setInquirySchoolName('');
        setInquiryName('');
        setInquiryMobile('');
        setInquiryEmail('');
        setInquirySchoolStrength('');
        setInquiryDescription('');
        setInquiryTouched({
          schoolName: false,
          name: false,
          mobile: false,
          email: false,
          strength: false,
          description: false
        });
        setInquiryErrors({
          schoolName: '',
          name: '',
          mobile: '',
          email: '',
          strength: '',
          description: ''
        });
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('erp_data_changed'));
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setInquiryError(data.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setInquiryError('Network connection error. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* ── HEADER NAVBAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[9999] w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-3.5 px-4 sm:px-8">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img 
              src="/track360_logo.png" 
              alt="Track 360 Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-md shrink-0" 
            />
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Track <span className="text-blue-600">360</span></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">360° School Operating System</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-extrabold text-slate-600">
            <a href="#hero" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">36 Modules</a>
            <a href="#innovative-showcase" className="hover:text-blue-600 transition-colors">Smart Tech</a>
            <a href="#personas" className="hover:text-blue-600 transition-colors">Role Portals</a>
            <a href="#enquiry" className="hover:text-blue-600 transition-colors">Enquiry Form</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/login" className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
              Login
            </Link>
            <a href="#enquiry" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5">
              Request Free Demo
            </a>
          </div>
        </nav>
      </header>

      {/* ── FIRST PAGE (HERO): NO IMAGE, CLEAN & POWERFUL WITH QUICK ENQUIRY FORM ── */}
      <section id="hero" className="relative pt-12 pb-20 px-4 sm:px-8 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/15 via-indigo-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Column (Pure Text & Value Props with Framer Motion) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-blue-100/90 border border-blue-200/80 px-4 py-1.5 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Trusted by 500+ Top Institutions Across India</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.215, 0.61, 0.355, 1.0] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
            >
              Power Your School With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">Next-Gen Cloud ERP</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-xl"
            >
              The most complete School Operating System with 36 integrated modules: Admissions, Fee Collection, AI Timetable Builder, Exam Marksheets, Live Transport GPS, HRMS, and Mobile Parent App.
            </motion.p>

            {/* Quick Value Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="grid grid-cols-2 gap-4 pt-2 font-medium text-xs text-slate-700"
            >
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex items-center space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
              >
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">☁️</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">100% Cloud Based</div>
                  <div className="text-[11px] text-slate-500">Zero server maintenance</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex items-center space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">⚡</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Go Live in 48 Hours</div>
                  <div className="text-[11px] text-slate-500">Free data migration</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex items-center space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all cursor-pointer"
              >
                <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">📱</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Mobile Parent App</div>
                  <div className="text-[11px] text-slate-500">iOS & Android included</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex items-center space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
              >
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">🔒</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Bank-Grade Security</div>
                  <div className="text-[11px] text-slate-500">SSL & Role permissions</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Right: Quick Enquiry Form */}
          <div id="enquiry" className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-slate-300/40 relative">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Free Demo & Quote
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Book Your Free Demo</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">Submit your details and get instant access to live demo & custom pricing.</p>

              {inquirySubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-emerald-900">Enquiry Submitted!</h4>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    Thank you! Your inquiry has been saved into system leads & notifications. Our ERP specialist will contact you within 30 minutes.
                  </p>
                  <button 
                    onClick={() => setInquirySubmitted(false)} 
                    className="mt-3 text-xs font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} noValidate className="space-y-4">
                  {inquiryError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  {/* 1. SCHOOL / COLLEGE NAME */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      School / College Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. St. Xavier International School"
                        value={inquirySchoolName}
                        onChange={(e) => handleInquiryChange('schoolName', e.target.value)}
                        onBlur={() => handleInquiryBlur('schoolName')}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-slate-900 ${
                          inquiryTouched.schoolName && inquiryErrors.schoolName
                            ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                            : inquiryTouched.schoolName && !inquiryErrors.schoolName && inquirySchoolName.trim()
                            ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                        }`}
                      />
                      {inquiryTouched.schoolName && inquiryErrors.schoolName && (
                        <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                      )}
                      {inquiryTouched.schoolName && !inquiryErrors.schoolName && inquirySchoolName.trim() && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                      )}
                    </div>
                    {inquiryTouched.schoolName && inquiryErrors.schoolName && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{inquiryErrors.schoolName}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. FULL NAME & MOBILE NO */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Dr. Rajesh Kumar"
                          value={inquiryName}
                          onChange={(e) => handleInquiryChange('name', e.target.value)}
                          onBlur={() => handleInquiryBlur('name')}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-slate-900 ${
                            inquiryTouched.name && inquiryErrors.name
                              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                              : inquiryTouched.name && !inquiryErrors.name && inquiryName.trim()
                              ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                              : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                          }`}
                        />
                        {inquiryTouched.name && inquiryErrors.name && (
                          <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                        {inquiryTouched.name && !inquiryErrors.name && inquiryName.trim() && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                      </div>
                      {inquiryTouched.name && inquiryErrors.name && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{inquiryErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Mobile No */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile No *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          placeholder="9876543210"
                          value={inquiryMobile}
                          onChange={(e) => handleInquiryChange('mobile', e.target.value)}
                          onBlur={() => handleInquiryBlur('mobile')}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-slate-900 ${
                            inquiryTouched.mobile && inquiryErrors.mobile
                              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                              : inquiryTouched.mobile && !inquiryErrors.mobile && inquiryMobile.trim()
                              ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                              : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                          }`}
                        />
                        {inquiryTouched.mobile && inquiryErrors.mobile && (
                          <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                        {inquiryTouched.mobile && !inquiryErrors.mobile && inquiryMobile.trim() && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                      </div>
                      {inquiryTouched.mobile && inquiryErrors.mobile && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{inquiryErrors.mobile}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. EMAIL ADDRESS & STUDENT STRENGTH */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="principal@school.edu"
                          value={inquiryEmail}
                          onChange={(e) => handleInquiryChange('email', e.target.value)}
                          onBlur={() => handleInquiryBlur('email')}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-slate-900 ${
                            inquiryTouched.email && inquiryErrors.email
                              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                              : inquiryTouched.email && !inquiryErrors.email && inquiryEmail.trim()
                              ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                              : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                          }`}
                        />
                        {inquiryTouched.email && inquiryErrors.email && (
                          <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                        {inquiryTouched.email && !inquiryErrors.email && inquiryEmail.trim() && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                      </div>
                      {inquiryTouched.email && inquiryErrors.email && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{inquiryErrors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Student Strength */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Student Strength
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="e.g. 800"
                          value={inquirySchoolStrength}
                          onChange={(e) => handleInquiryChange('strength', e.target.value)}
                          onBlur={() => handleInquiryBlur('strength')}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-slate-900 ${
                            inquiryTouched.strength && inquiryErrors.strength
                              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                              : inquiryTouched.strength && !inquiryErrors.strength && inquirySchoolStrength.trim()
                              ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                              : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                          }`}
                        />
                        {inquiryTouched.strength && inquiryErrors.strength && (
                          <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                        {inquiryTouched.strength && !inquiryErrors.strength && inquirySchoolStrength.trim() && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                        )}
                      </div>
                      {inquiryTouched.strength && inquiryErrors.strength && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{inquiryErrors.strength}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. REQUIREMENTS / REMARKS */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requirements / Remarks
                    </label>
                    <div className="relative">
                      <textarea
                        rows="2"
                        placeholder="Tell us about your school requirements..."
                        value={inquiryDescription}
                        onChange={(e) => handleInquiryChange('description', e.target.value)}
                        onBlur={() => handleInquiryBlur('description')}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none resize-none transition-all text-slate-900 ${
                          inquiryTouched.description && inquiryErrors.description
                            ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500'
                            : inquiryTouched.description && !inquiryErrors.description && inquiryDescription.trim()
                            ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
                        }`}
                      ></textarea>
                    </div>
                    {inquiryTouched.description && inquiryErrors.description && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{inquiryErrors.description}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    style={{ color: '#ffffff', backgroundColor: '#059669' }}
                    className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 text-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submittingInquiry ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Submitting Enquiry...
                      </>
                    ) : (
                      <>🚀 Submit Enquiry & Get Free Demo</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS BAR SECTION ────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">500+</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">Institutions Trusted</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">2L+</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">Students Managed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">36</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">Integrated ERP Modules</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">99.9%</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">Uptime SLA</div>
          </div>
        </div>
      </section>

      {/* ── ALL 36 MODULES IN OUR APPLICATION (WITH FRAMER MOTION ANIMATED HEADINGS) ── */}
      <section id="modules" className="py-16 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-300"
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-md">
                36 ACTUAL SYSTEM APPLICATION MODULES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                All 36 Modules <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">In Our Application</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
              Comprehensive suite of 36 integrated modules available in the ERP application.
            </p>
          </motion.div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 36 APPLICATION MODULE CARDS (8 COLUMNS GRID EXACT MATCH) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {filteredModules.map((mod, idx) => {
              const IconC = mod.icon;
              return (
                <div 
                  key={idx}
                  className="group bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-default relative overflow-hidden h-[84px]"
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
                  {/* Icon Container: Soft pastel colored circle badge */}
                  <div 
                    style={{ backgroundColor: `${mod.color}18`, color: mod.color }} 
                    className="icon-box w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                  >
                    <IconC className="w-3.5 h-3.5 transition-colors duration-200" />
                  </div>

                  {/* Title Text */}
                  <span 
                    style={{ color: '#0f172a' }} 
                    className="card-title text-[11px] font-extrabold transition-colors duration-200 leading-tight line-clamp-2"
                  >
                    {mod.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 text-center">
            <span className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-emerald-800 text-xs font-bold">
              ✓ All 36 Modules Ready in System
            </span>
          </div>

        </div>
      </section>

      {/* ── INNOVATIVE SMART CAMPUS TECH SHOWCASE (CREATIVE IMAGE INTEGRATION) ── */}
      <section id="innovative-showcase" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-3.5 py-1.5 rounded-md">
              INNOVATIVE CAMPUS TECH
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Transforming Traditional Schools into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">Smart Digital Hubs</span>
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Seamlessly connecting physical campus infrastructure with intelligent cloud automation.
            </p>
          </div>

          {/* Innovative Visual Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 1: Modern Campus Architecture & Smart Infrastructure (Large Feature) */}
            <div className="lg:col-span-7 relative group rounded-3xl overflow-hidden shadow-2xl border border-slate-200 min-h-[380px] flex flex-col justify-end">
              <img
                src="/school-campus.png"
                alt="Smart School Campus Infrastructure"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
              
              {/* Floating Tech Badges */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-20">
                <span className="bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5">
                  <span>🏛️</span>
                  <span>Smart Campus OS</span>
                </span>
                <span className="bg-blue-600/95 backdrop-blur-md text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5">
                  <span>⚡</span>
                  <span>99.9% Uptime</span>
                </span>
              </div>

              <div className="relative z-20 p-8 space-y-3">
                <h3 style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }} className="text-2xl sm:text-3xl font-black">
                  Automated Campus Operations
                </h3>
                <p style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }} className="text-xs sm:text-sm font-bold leading-relaxed max-w-lg">
                  Unify multi-branch governance, financial auditing, inventory assets, biometric staff clock-in, and visitor gate passes from a single executive control center.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-black">
                  <span style={{ color: '#ffffff', backgroundColor: 'rgba(15, 23, 42, 0.85)' }} className="px-3.5 py-1.5 rounded-xl border border-white/40 shadow-md">Multi-Branch Sync</span>
                  <span style={{ color: '#ffffff', backgroundColor: 'rgba(15, 23, 42, 0.85)' }} className="px-3.5 py-1.5 rounded-xl border border-white/40 shadow-md">Biometric API</span>
                  <span style={{ color: '#ffffff', backgroundColor: 'rgba(15, 23, 42, 0.85)' }} className="px-3.5 py-1.5 rounded-xl border border-white/40 shadow-md">Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Card 2 & 3: Right Side Stack */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              
              {/* Card 2: Smart Classroom Digital Learning */}
              <div className="relative group rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[220px] flex flex-col justify-end">
                <img
                  src="/smart-classroom.png"
                  alt="Smart Digital Classroom"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />
                
                <div className="absolute top-4 left-4 bg-emerald-600/95 backdrop-blur-md font-black text-xs px-3 py-1 rounded-lg shadow-md z-20" style={{ color: '#ffffff' }}>
                  🎓 Smart Classrooms & LMS
                </div>

                <div className="relative z-20 p-6 space-y-1.5">
                  <h4 style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }} className="text-xl font-black">
                    Digital Learning & Marksheets
                  </h4>
                  <p style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }} className="text-xs font-bold">
                    Instant report card generation, online quizzes, and interactive teacher gradebook.
                  </p>
                </div>
              </div>

              {/* Card 3: Transport GPS & Parent App */}
              <div className="relative group rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[220px] flex flex-col justify-end">
                <img
                  src="/parent-bus.png"
                  alt="Live Transport GPS & Parent App"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />
                
                <div className="absolute top-4 left-4 bg-amber-500/95 backdrop-blur-md font-black text-xs px-3 py-1 rounded-lg shadow-md z-20" style={{ color: '#ffffff' }}>
                  🚌 Live GPS Fleet & Parent App
                </div>

                <div className="relative z-20 p-6 space-y-1.5">
                  <h4 style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }} className="text-xl font-black">
                    Live Transport & Parent Portal
                  </h4>
                  <p style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }} className="text-xs font-bold">
                    Real-time bus tracking, automated WhatsApp fee alerts, and direct teacher chat.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── ROLE-BASED BENEFITS SECTION (WITH FRAMER MOTION ANIMATION) ─────────────────────────────────── */}
      <section id="personas" className="py-16 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-3.5 py-1 rounded-md">
              DESIGNED FOR EVERY PERSONA
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              One Unified System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">All Stakeholders</span>
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Tailored experience and role-based permissions for every user in your school ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Persona 1: Management */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                🏫
              </div>
              <h3 className="text-lg font-black text-slate-900">Principals & Trustees</h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Real-time fee collection analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Multi-branch central overview</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>AI early warning for dropout risks</span>
                </li>
              </ul>
            </div>

            {/* Persona 2: Teachers */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                👨‍🏫
              </div>
              <h3 className="text-lg font-black text-slate-900">Teachers & Staff</h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>1-click attendance marking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Instant homework & assignment posting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Automated gradebook & report cards</span>
                </li>
              </ul>
            </div>

            {/* Persona 3: Parents & Students */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                📱
              </div>
              <h3 className="text-lg font-black text-slate-900">Parents & Students</h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Mobile app for fees, marks & attendance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Live GPS bus tracking & alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Direct teacher communication channel</span>
                </li>
              </ul>
            </div>

            {/* Persona 4: Accountants */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                💳
              </div>
              <h3 className="text-lg font-black text-slate-900">Accountants & Admin</h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Automated digital fee receipts & GST</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Automated WhatsApp fee reminders</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Payroll, PF/ESI & inventory management</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS & REVIEWS SECTION ───────────────────────────────── */}
      <TestimonialSliderSection />


      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) ──────────────────── */}
      <section className="py-16 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-100 px-3.5 py-1 rounded-md">
              GOT QUESTIONS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How long does onboarding and data migration take?",
                a: "Our dedicated technical team migrates all your existing student, teacher, fee, and mark history into the system free of cost. Your institution can go live within 48 hours."
              },
              {
                q: "Are mobile apps for parents and teachers included in the subscription?",
                a: "Yes! Native cross-platform mobile apps for iOS and Android are included with every subscription plan at no extra license fee."
              },
              {
                q: "Can we integrate our existing biometric or RFID attendance devices?",
                a: "Absolutely. The system supports direct cloud API integration with all standard biometric fingerprint, face recognition, and RFID gate hardware."
              },
              {
                q: "Can automated WhatsApp fee reminders and marks be sent to parents?",
                a: "Yes, our platform includes automated WhatsApp and SMS triggers for fee due alerts, exam report cards, daily attendance, and circulars."
              }
            ].map((faq, fIdx) => (
              <div 
                key={fIdx} 
                className="bg-white border border-slate-200/80 rounded-2xl p-5 cursor-pointer hover:border-blue-300 transition-all shadow-xs"
                onClick={() => toggleFaq(fIdx)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{faq.q}</h4>
                  <span className="text-blue-600 font-bold text-lg leading-none">
                    {activeFaq === fIdx ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === fIdx && (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-3 pt-3 border-t border-slate-200/60 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CONVERSION CTA BANNER ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/20 px-4 py-1.5 rounded-full border border-amber-400/40 inline-block">
            READY TO ELEVATE YOUR SCHOOL?
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Transform Your Institution With All 36 Modules Today
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Join 500+ institutions operating smarter. Request a personalized 1-on-1 demo with our ERP expert.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#enquiry" 
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-950/60 transform hover:-translate-y-0.5"
            >
              🚀 Book Free Personalized Demo
            </a>
            <Link 
              href="/login" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold px-8 py-4 rounded-2xl transition-all"
            >
              🔑 Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── NIKE STYLE SIGNATURE FOOTER (GREEN BG + PURE WHITE TEXT) ──── */}
      <footer style={{ backgroundColor: '#024a34', color: '#ffffff' }} className="font-sans border-t border-emerald-700/80 shadow-2xl">
        
        {/* Main Footer Links & Columns Grid */}
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 border-b border-emerald-800/80">
          
          {/* Column 1: Featured Primary Links (Bold Uppercase Nike Style - Pure White) */}
          <div className="space-y-3.5 text-xs font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>
            <div>
              <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                FIND A SCHOOL WORKSPACE
              </a>
            </div>
            <div>
              <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                BECOME A PARTNER INSTITUTION
              </a>
            </div>
            <div>
              <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                EXPLORE 36+ SYSTEM MODULES
              </a>
            </div>
            <div>
              <a href="#testimonials" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                CUSTOMER REVIEWS & TESTIMONIALS
              </a>
            </div>
            <div>
              <Link href="/login" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                SIGN IN TO PORTAL
              </Link>
            </div>
            <div>
              <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                REQUEST A PERSONALIZED DEMO
              </a>
            </div>
          </div>

          {/* Column 2: GET HELP */}
          <div className="space-y-3 text-xs">
            <h4 style={{ color: '#f59e0b' }} className="font-black text-xs uppercase tracking-widest mb-4">
              GET HELP
            </h4>
            <ul className="space-y-2.5 font-bold">
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Admission & Onboarding Support
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Fee Gateway Integration
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  GPS & Hardware Support
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Payment Options & Pricing
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Contact Us (1800-TRACK360)
                </a>
              </li>
              <li>
                <Link href="/login" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Account Recovery & Password Reset
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT TRACK 360 */}
          <div className="space-y-3 text-xs">
            <h4 style={{ color: '#f59e0b' }} className="font-black text-xs uppercase tracking-widest mb-4">
              ABOUT TRACK 360
            </h4>
            <ul className="space-y-2.5 font-bold">
              <li>
                <a href="#overview" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  About Our AI Engine
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  System Architecture
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Careers & Partner Hiring
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Enterprise Investors
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Campus Sustainability
                </a>
              </li>
              <li>
                <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Data Privacy & 256-Bit SSL
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: ERP MODULE CATALOG */}
          <div className="space-y-3 text-xs">
            <h4 style={{ color: '#f59e0b' }} className="font-black text-xs uppercase tracking-widest mb-4">
              36 ERP MODULES
            </h4>
            <ul className="space-y-2.5 font-bold">
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Student Directory & Admissions
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Fee Management & Receipts
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Smart Attendance & GPS Clock
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  LMS, Timetable & Homework
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  Staff HRMS & Payroll System
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors block">
                  AI Risk & Grade Detector
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media & Region Selector */}
          <div className="space-y-6">
            
            {/* Social Media Circular Buttons (High-Contrast White & Gold) */}
            <div>
              <h4 style={{ color: '#f59e0b' }} className="font-black text-xs uppercase tracking-widest mb-4">
                CONNECT WITH US
              </h4>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Twitter / X */}
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-emerald-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-sm border border-emerald-600/80"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-emerald-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-sm border border-emerald-600/80"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-emerald-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-sm border border-emerald-600/80"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-emerald-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-sm border border-emerald-600/80"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Region Selector */}
            <div className="pt-2">
              <button 
                type="button" 
                style={{ color: '#ffffff' }}
                className="flex items-center gap-2 text-xs font-bold hover:text-amber-300 transition-colors"
              >
                <Globe className="w-4 h-4 text-emerald-200" />
                <span>India | English (US)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Legal & Copyright Bar (Nike Signature Styling) */}
        <div style={{ color: '#ffffff' }} className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          
          {/* Left Copyright & Location */}
          <div className="flex items-center gap-4 flex-wrap">
            <span style={{ color: '#ffffff' }} className="flex items-center gap-1.5 font-bold">
              <MapPin className="w-4 h-4 text-amber-400 fill-current" />
              <span>India</span>
            </span>
            <span style={{ color: '#ffffff' }} className="font-semibold">© {new Date().getFullYear()} Track 360, Inc. All Rights Reserved</span>
          </div>

          {/* Right Legal Links */}
          <div className="flex items-center gap-6 flex-wrap font-bold">
            <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors">Guides</a>
            <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors">Terms of Sale</a>
            <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors">Terms of Use</a>
            <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors">Track 360 Privacy Policy</a>
            <a href="#enquiry" style={{ color: '#ffffff' }} className="hover:text-amber-300 transition-colors">Cookie Settings</a>
          </div>

        </div>

      </footer>

    </div>
  );
}

// ─── DYNAMIC TESTIMONIAL SLIDER & SCHOOL ADMIN SUBMISSION MODAL ─────────────
function TestimonialSliderSection() {
  const [testimonials, setTestimonials] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Principal');
  const [schoolName, setSchoolName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch Approved Testimonials from Server API
  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch(() => {});
  }, []);

  // Smooth Auto-scroll Slider (3.5s interval, pauses on hover)
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, role, schoolName, text, rating: Number(rating) };
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setName('');
        setSchoolName('');
        setText('');
      }, 2000);
    } catch (e) {
      setSubmitSuccess(true);
      setShowSubmitModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section 
      id="testimonials"
      className="py-24 px-4 sm:px-8 bg-gradient-to-br from-slate-100 via-emerald-50/25 to-blue-50/30 border-b border-slate-200 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Ambient Radial Glow Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Giant Decorative Quote, Title & Interactive Auto-Scroll Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Giant Styled Quote Icon with Gradient */}
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600 text-7xl font-serif font-black leading-none select-none tracking-tighter opacity-80">
            ““
          </div>

          {/* Section Headline */}
          <div className="space-y-2.5">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              What our <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">customers are saying</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Hover over cards to pause auto-scrolling. 500+ verified school reviews.
            </p>
          </div>

          {/* Minimal Auto-Scroll Controls (Left Arrow, Gradient Progress Line, Right Arrow) */}
          <div className="flex items-center space-x-4 pt-2">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              aria-label="Previous Review"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:shadow-md"
            >
              <span className="text-base font-black">←</span>
            </button>

            {/* Sleek Gradient Progress Line Track */}
            <div className="w-32 sm:w-40 h-1.5 bg-slate-200/80 rounded-full relative overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full"
                animate={{ 
                  width: `${((currentIndex + 1) / Math.max(1, testimonials.length)) * 100}%` 
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              aria-label="Next Review"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:text-blue-600 hover:border-blue-500 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:shadow-md"
            >
              <span className="text-base font-black">→</span>
            </button>
          </div>

        </div>

        {/* Right Column: Speech-Bubble Cards Single Row Auto-Scroll Slider */}
        <div className="lg:col-span-8 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(() => {
              if (!testimonials || testimonials.length === 0) {
                return (
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 text-center space-y-2 col-span-full">
                    <div className="text-lg font-black text-slate-800">No Approved Reviews Yet</div>
                    <p className="text-xs text-slate-500 font-medium">Approved school reviews from the database will display here automatically.</p>
                  </div>
                );
              }
              const visibleCount = Math.min(3, testimonials.length);
              const visibleItems = [];
              for (let i = 0; i < visibleCount; i++) {
                const itemIndex = (currentIndex + i) % testimonials.length;
                visibleItems.push({ ...testimonials[itemIndex], originalIndex: itemIndex });
              }

              return visibleItems.map((t, idx) => (
                <div key={t._id || `${t.originalIndex}-${idx}`} className="space-y-4 flex flex-col">
                  
                  {/* Speech Bubble Box with Dynamic Auto-Height so Full Text Displays */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200/90 hover:border-emerald-300 flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        {/* 5 Emerald Green Stars */}
                        <div className="flex items-center space-x-1 text-emerald-500 font-extrabold text-sm">
                          {'★'.repeat(t.rating || 5)}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                        "{t.text}"
                      </p>
                    </div>

                    {/* Speech Bubble Tail Triangle (Points Down) */}
                    <div 
                      className="absolute -bottom-3 left-7 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.06)]"
                    />
                  </motion.div>

                  {/* Author Avatar & Details below the speech bubble */}
                  <div className="flex items-center space-x-3.5 pl-3 pt-1">
                    <div
                      style={{ backgroundColor: t.color || '#2563eb' }}
                      className="w-10 h-10 rounded-full text-white font-black flex items-center justify-center text-sm shadow-md ring-2 ring-emerald-500/20 shrink-0 uppercase"
                    >
                      {t.avatar || (t.name ? t.name.charAt(0) : 'U')}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500 font-extrabold">{t.role} • {t.schoolName}</div>
                    </div>
                  </div>

                </div>
              ));
            })()}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

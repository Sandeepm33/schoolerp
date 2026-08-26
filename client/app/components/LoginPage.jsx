'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Key, ShieldCheck, Mail, Lock, Eye, EyeOff, 
  Sparkles, Zap, Globe, Users, ArrowRight, CheckCircle2, 
  Cpu, HardDrive, Shield, AlertCircle, Award, BookOpen, Clock, Activity, Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const userObj = await loginWithCredentials(email, password);
      if (userObj && (userObj.role || userObj.email)) {
        const userRole = userObj.role;
        if (userRole === 'SAAS_SUPER_ADMIN') router.push('/saas-admin');
        else if (userRole === 'SCHOOL_ADMIN') router.push('/admin/dashboard');
        else if (userRole === 'ACCOUNTANT') router.push('/accountant');
        else if (userRole === 'TEACHER') router.push('/teacher');
        else if (userRole === 'PARENT' || userRole === 'STUDENT') router.push('/parent');
        else router.push('/admin/dashboard');
      } else {
        setLocalError('Invalid credentials or suspended account access.');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-8 overflow-hidden select-none bg-slate-950">
      
      {/* 100% VIBRANT ST. XAVIER'S HERITAGE BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/st_xaviers_school.png" 
          alt="St. Xavier's Collegiate School Kolkata Heritage Campus" 
          className="w-full h-full object-cover filter brightness-105 contrast-105 saturate-110"
        />
        {/* Transparent Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/20 to-slate-950/40" />
      </div>

      {/* Radiant Sunlight Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Main Grid Container */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: DIRECT FLOATING TYPOGRAPHY */}
        <div className="lg:col-span-7 space-y-6 pr-0 lg:pr-6">
          
          <div className="space-y-4">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/30 border border-amber-300/60 text-amber-100 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-lg">
              <Landmark className="w-4 h-4 text-amber-300" />
              <span>St. Xavier’s Collegiate School Kolkata • Heritage ERP</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Where Heritage Legacy Meets <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-indigo-200 bg-clip-text text-transparent">
                Next-Gen AI School ERP
              </span>
            </h1>

            <p className="text-slate-100 text-sm lg:text-base leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-2xl">
              Designed for Kolkata’s iconic St. Xavier’s Collegiate School & premier Indian international campuses. Powered by AI Timetable Generators, Real-Time Fee Audits, and Live MongoDB Atlas Data Engine.
            </p>

            {/* FLOATING HIGHLIGHT PILLS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-400/50 backdrop-blur-md flex items-center space-x-3 shadow-xl">
                <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400/50">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">ICSE / ISC Ready</h4>
                  <p className="text-[10px] text-amber-200 font-medium">Board grading</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-indigo-400/50 backdrop-blur-md flex items-center space-x-3 shadow-xl">
                <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/50">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">AI Timetable Solver</h4>
                  <p className="text-[10px] text-indigo-200 font-medium">Conflict-free</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-400/50 backdrop-blur-md flex items-center space-x-3 shadow-xl">
                <div className="p-2 rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">Live Atlas Cloud</h4>
                  <p className="text-[10px] text-emerald-200 font-medium">MongoDB database</p>
                </div>
              </div>
            </div>

            {/* System Status Ticker */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-100 pt-3 border-t border-white/20 font-bold drop-shadow">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-white">St. Xavier’s Campus Online</span>
              </div>
              <span>•</span>
              <span className="text-slate-100">MongoDB Atlas Connected</span>
              <span>•</span>
              <span className="text-slate-100">99.99% Uptime</span>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: TRANSLUCENT FROSTED GLASS LOGIN PORTAL CARD (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 lg:p-8 rounded-3xl border border-white/30 shadow-2xl shadow-slate-950/80 space-y-6 relative overflow-hidden backdrop-blur-2xl bg-slate-950/40">
            
            {/* Top Card Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-400/40">
                  SSO Workspace Portal
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">v2.0.4</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight pt-1 drop-shadow">Sign In to Workspace</h2>
              <p className="text-xs text-slate-200 font-medium">Enter your account credentials to access your portal</p>
            </div>

            {/* ERROR DISPLAY */}
            {(localError || authError) && (
              <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-400/70 text-rose-100 text-xs font-bold flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* CLEAN CREDENTIAL LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-white block mb-1">Work Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. user@school.com"
                    className="w-full bg-slate-950/50 border border-white/20 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all font-semibold shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-white">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all font-mono font-semibold shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 gradient-primary text-white rounded-xl font-black text-xs tracking-wide shadow-xl shadow-indigo-500/40 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* QUICK-LOGIN CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SUPER ADMIN QUICK-LOGIN */}
              <div className="relative rounded-2xl border border-amber-400/40 bg-amber-500/10 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
                
                <div className="relative p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-amber-500/30 border border-amber-400/50">
                        <ShieldCheck className="w-3 h-3 text-amber-300" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                        Super Admin
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-2 py-1.5 border border-white/10">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-200 font-mono font-semibold truncate">superadmin@saas.com</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-2 py-1.5 border border-white/10">
                      <Key className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-200 font-mono font-semibold">password123</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('superadmin@saas.com');
                      setPassword('password123');
                    }}
                    className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 text-[10px] font-black tracking-wide flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <Zap className="w-3 h-3 group-hover:text-amber-300 transition-colors" />
                    Auto-fill
                  </button>
                </div>
              </div>

              {/* SCHOOL ADMIN QUICK-LOGIN */}
              <div className="relative rounded-2xl border border-indigo-400/40 bg-indigo-500/10 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
                
                <div className="relative p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-indigo-500/30 border border-indigo-400/50">
                        <Building2 className="w-3 h-3 text-indigo-300" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">
                        School Admin
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-2 py-1.5 border border-white/10">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-200 font-mono font-semibold truncate">admin@school.com</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-2 py-1.5 border border-white/10">
                      <Key className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-200 font-mono font-semibold">password123</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@school.com');
                      setPassword('password123');
                    }}
                    className="w-full py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/50 text-indigo-200 text-[10px] font-black tracking-wide flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <Zap className="w-3 h-3 group-hover:text-indigo-300 transition-colors" />
                    Auto-fill
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1 text-center text-[10px] text-slate-200 font-bold">
              Enterprise MongoDB Atlas Persistence • Strict Tenant Security Rules
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

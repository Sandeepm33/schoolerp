'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Key, Lock, Eye, EyeOff, 
  Sparkles, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2,
  X, ShieldCheck, Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StandaloneLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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
        else if (userRole === 'TEACHER') router.push('/teacher');
        else if (userRole === 'ACCOUNTANT') router.push('/accountant');
        else router.push('/admin/dashboard');
      } else {
        setLocalError('Invalid credentials or suspended account access.');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950 overflow-hidden font-sans">
      
      {/* Fullscreen Background Image with Dim Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 pointer-events-none"
        style={{ 
          backgroundImage: `url('/school_campus_login.png')`,
          filter: 'brightness(0.25) contrast(1.1) blur(2px)'
        }}
      />
      <div className="absolute inset-0 bg-slate-950/80 pointer-events-none" />

      {/* TOP FLOATING BACK BUTTON */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => router.push('/')}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="px-4 py-2 rounded-full border text-xs font-extrabold hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <ArrowLeft style={{ color: '#34d399' }} className="w-4 h-4" />
          <span style={{ color: '#ffffff' }}>Back</span>
        </button>
      </div>

      {/* CENTERED SPLIT GLASS CARD (EXACT MATCH TO REFERENCE DESIGN) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto shadow-[0_30px_90px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden border border-white/10 my-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          
          {/* LEFT COLUMN: BRAND & WELCOME BACK BANNER */}
          <div 
            style={{ backgroundColor: '#09211a' }} 
            className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient Inner Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[90px] pointer-events-none" />

            {/* Top Logo & Brand Name */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md">
                <Sparkles style={{ color: '#059669' }} className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span style={{ color: '#ffffff' }} className="text-xl font-black tracking-tight">AI SCHOOL ERP</span>
                </div>
                <p style={{ color: '#34d399' }} className="text-[11px] font-extrabold tracking-wide">Campus OS Redefined</p>
              </div>
            </div>

            {/* Middle Headline */}
            <div className="relative z-10 my-10 space-y-3">
              <h1 style={{ color: '#ffffff' }} className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                Welcome Back <br />
                To Your Campus
              </h1>
              <p style={{ color: '#d1fae5' }} className="text-sm font-medium leading-relaxed max-w-sm">
                Sign in to manage your school operations, track academics, enter grades, and stay updated with live campus activities.
              </p>
            </div>

            {/* Bottom Security Badge */}
            <div className="relative z-10 flex items-center gap-2 font-bold text-xs pt-4 border-t border-emerald-900/80">
              <ShieldCheck style={{ color: '#fbbf24' }} className="w-4 h-4" />
              <span style={{ color: '#fbbf24' }}>Secure Campus OS Platform</span>
            </div>

          </div>

          {/* RIGHT COLUMN: ACCESS PORTAL LOGIN FORM */}
          <div 
            style={{ backgroundColor: '#07100d' }} 
            className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between relative"
          >
            <div>
              {/* Header */}
              <div className="mb-2">
                <h2 style={{ color: '#ffffff' }} className="text-2xl font-black tracking-tight">Access Portal</h2>
              </div>

              <p style={{ color: '#94a3b8' }} className="text-xs font-semibold mb-6">
                Login to your school dashboard
              </p>

              {/* Error Notification */}
              {(localError || authError) && (
                <div className="mb-4 bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-2xl text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Field 1: Work Email or Mobile */}
                <div className="space-y-1.5">
                  <label style={{ color: '#34d399' }} className="text-xs font-extrabold flex items-center gap-1.5">
                    <Smartphone style={{ color: '#34d399' }} className="w-3.5 h-3.5" />
                    <span>Work Email or Mobile</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@school.com"
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-full rounded-2xl px-4 py-3.5 text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all border-none shadow-inner"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1.5">
                  <label style={{ color: '#34d399' }} className="text-xs font-extrabold flex items-center gap-1.5">
                    <Lock style={{ color: '#34d399' }} className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-full rounded-2xl pl-4 pr-10 py-3.5 text-xs font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all border-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-900"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-right pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      style={{ color: '#fbbf24' }}
                      className="text-xs font-extrabold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#f59e0b', color: '#090d16' }}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
                >
                  <span style={{ color: '#090d16' }}>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight style={{ color: '#090d16' }} className="w-4 h-4" />
                </button>

              </form>
            </div>

            {/* Footer Note */}
            <div className="pt-6 border-t border-white/10 text-center text-xs font-medium mt-4">
              <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => router.push('/')}
                style={{ color: '#fbbf24' }}
                className="font-extrabold hover:underline"
              >
                Contact Admin
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div style={{ backgroundColor: '#07100d' }} className="border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div style={{ backgroundColor: '#f59e0b', color: '#090d16' }} className="w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 style={{ color: '#ffffff' }} className="text-base font-black">Reset Workspace Password</h3>
                  <p style={{ color: '#94a3b8' }} className="text-[10px] font-bold">Verify registered email to receive OTP</p>
                </div>
              </div>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>Password reset instructions sent to registered email!</div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs font-bold">
                <div>
                  <label style={{ color: '#34d399' }} className="mb-1 block">Work Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@school.com" 
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    className="w-full p-3 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ backgroundColor: '#f59e0b', color: '#090d16' }}
                  className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  <span style={{ color: '#090d16' }}>Send Reset Link</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

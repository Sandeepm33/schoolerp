'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Star, X, CheckCircle, Sparkles, Send } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function SubmitTestimonialModal({ isOpen, onClose }) {
  const { user, token } = useAuth();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('School Admin');
  const [schoolName, setSchoolName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      let activeUser = user;
      if (!activeUser) {
        try {
          const saved = localStorage.getItem('erp_user');
          if (saved) activeUser = JSON.parse(saved);
        } catch (e) {}
      }

      setName(activeUser?.name || '');
      setRole(activeUser?.designation || activeUser?.role || 'School Admin');
      setSchoolName(activeUser?.schoolName || 'Our Institution');
      setText('');
      setRating(5);
      setSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const activeToken = token || localStorage.getItem('erp_token') || 'demo_token_school_admin';
      const payload = {
        name,
        role,
        schoolName,
        text,
        rating: Number(rating),
        avatar: (name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()) || 'SA',
        color: '#02563d'
      };

      const res = await fetch(`${API_BASE}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setErrorMsg(data.message || 'Failed to submit testimonial. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to submit testimonial.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-emerald-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 my-auto relative z-10 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Submit School Testimonial
            </h3>
            <p className="text-xs text-slate-400 font-medium">Share your experience with Track 360 to feature on the Landing Page</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 my-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h4 className="text-lg font-black text-emerald-300">Submitted to SuperAdmin!</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Thank you, <strong>{name}</strong>! Your testimonial for <strong>{schoolName}</strong> has been submitted. It will appear on the public landing page slider once approved by Super Admin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal / Director"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">School / Campus Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi Public School"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">Star Rating</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                <option value={1}>⭐ (1 Star - Poor)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">Your Review / Testimonial Quote *</label>
                <span className="text-[10px] font-bold text-emerald-400">{text.length}/180 chars max</span>
              </div>
              <textarea
                rows={4}
                required
                maxLength={180}
                placeholder="Share how Track 360 improved fee collections, attendance, report cards, or campus operations..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Testimonial for SuperAdmin Approval'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>,
    document.body
  );
}

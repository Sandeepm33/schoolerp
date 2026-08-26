'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Award, Sparkles, FileText } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Page() {
  const { token, user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const hwRes = await fetch(`${API_BASE}/homework`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (hwRes.ok) setHomework(await hwRes.json().catch(() => []));

      const markRes = await fetch(`${API_BASE}/marks`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (markRes.ok) setMarks(await markRes.json().catch(() => []));
    } catch (e) {
      console.warn('Student fetch error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <h2 className="text-xl font-black text-white">Student Academic & Learning Portal</h2>
        <p className="text-xs text-slate-400">{user?.name || 'Student Portal'} • {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Homework & LMS Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Assigned LMS & Homework
          </h3>

          {homework.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
              <BookOpen className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">No Homework Assigned Yet</p>
              <p>Homework assigned by your teachers will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {homework.map((hw, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <span className="text-indigo-400 font-bold">{hw.subject}</span>
                  <h4 className="font-bold text-white">{hw.title}</h4>
                  <p className="text-slate-400">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mid-Term Results Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" /> Academic Results
          </h3>

          {marks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
              <Award className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">No Examination Marks Released Yet</p>
              <p>Exam report cards published by school administration will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {marks.map((m, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-purple-500/20 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>{m.examTitle || 'Exam'}</span>
                    <strong className="text-purple-400">{m.percentage}%</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

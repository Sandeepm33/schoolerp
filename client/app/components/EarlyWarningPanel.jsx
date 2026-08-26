'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function EarlyWarningPanel() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/early-warning`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setAlerts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Early warning fetch error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> AI Early Warning Risk Detector <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400">Automated AI detection of low attendance & academic performance declines</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">
          {alerts.length} Risks Flagged
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <strong className="block text-white font-bold">All Clear — 0 Risks Flagged</strong>
            <span>All students in this school are maintaining healthy attendance and academic standing.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{item.studentName || 'Student'} ({item.classId})</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase">
                  {item.riskLevel || 'HIGH RISK'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-slate-300">
                <span>Attendance: <strong className="text-rose-400">{item.attendancePct || 0}%</strong></span>
                <span>Avg Marks: <strong className="text-amber-400">{item.marksAvg || 0}%</strong></span>
              </div>
              <p className="text-slate-400 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <strong>AI Action Recommendation:</strong> {item.recommendation || 'Schedule academic counseling session.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

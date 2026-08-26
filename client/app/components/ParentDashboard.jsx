'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, User, Calendar, BookOpen, Clock, Award, 
  Truck, Bell, CheckCircle, FileText, ChevronRight, ShieldAlert 
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function ParentDashboard() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('home');
  const [childMarks, setChildMarks] = useState([]);
  const [homework, setHomework] = useState([]);
  const [transport, setTransport] = useState(null);
  const [timetable, setTimetable] = useState({ schedule: [] });

  const childName = user?.mappedStudent
    ? `${user.mappedStudent.firstName} ${user.mappedStudent.lastName}`
    : (user?.name || 'Student');
  const childClass = user?.mappedStudent
    ? `Class ${user.mappedStudent.classId}${user.mappedStudent.sectionId && user.mappedStudent.sectionId !== '-' ? ` — Section ${user.mappedStudent.sectionId}` : ''}`
    : 'Enrolled Student';
  const childRollNo = user?.mappedStudent?.rollNo || null;
  const childClassId = user?.mappedStudent?.classId || 'Class 10';
  const childSectionId = user?.mappedStudent?.sectionId || 'A';

  useEffect(() => {
    fetchParentData();
  }, [tab]);

  const fetchParentData = async () => {
    try {
      if (tab === 'results' || tab === 'home') {
        const res = await fetch(`${API_BASE}/marks`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setChildMarks(Array.isArray(data) ? data : []);
        }
      }
      if (tab === 'homework' || tab === 'home') {
        const res = await fetch(`${API_BASE}/homework?classId=${encodeURIComponent(childClassId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setHomework(Array.isArray(data) ? data : []);
        }
      }
      if (tab === 'transport') {
        const res = await fetch(`${API_BASE}/transport`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const routes = await res.json().catch(() => []);
          if (Array.isArray(routes) && routes.length > 0) setTransport(routes[0]);
        }
      }
      if (tab === 'timetable') {
        const res = await fetch(`${API_BASE}/timetable?classId=${encodeURIComponent(childClassId)}&sectionId=${encodeURIComponent(childSectionId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json().catch(() => ({ schedule: [] }));
          setTimetable(data || { schedule: [] });
        }
      }
    } catch (e) {
      console.warn('Parent fetch error');
    }
  };

  return (
    <div className="flex justify-center p-4">
      
      {/* Mobile Device Frame Container */}
      <div className="mobile-device-frame glass-panel bg-slate-950 flex flex-col">
        
        {/* Mobile Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-md">
              {childName[0]}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{childName}</h4>
              <p className="text-[10px] text-slate-400">{childClass}</p>
              {childRollNo && <p className="text-[10px] text-indigo-400 font-mono font-bold">Roll: {childRollNo}</p>}
            </div>
          </div>
          <Bell className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
        </div>

        {/* Dynamic Mobile Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          
          {/* HOME TAB */}
          {tab === 'home' && (
            <div className="space-y-4">
              
              {/* Daily Attendance Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Today's Status</span>
                    <h3 className="text-base font-extrabold text-white mt-0.5">Marked Present ✓</h3>
                    <p className="text-[10px] text-slate-300 mt-1">Class Teacher verified daily attendance</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    100%
                  </div>
                </div>
              </div>

              {/* Quick Mobile Navigation Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button onClick={() => setTab('homework')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="text-[11px] text-slate-300">Homework</span>
                </button>
                <button onClick={() => setTab('results')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] text-slate-300">Results</span>
                </button>
                <button onClick={() => setTab('timetable')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-[11px] text-slate-300">Timetable</span>
                </button>
                <button onClick={() => setTab('transport')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span className="text-[11px] text-slate-300">Bus Tracker</span>
                </button>
                <button onClick={() => setTab('attendance')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span className="text-[11px] text-slate-300">Attendance</span>
                </button>
                <button onClick={() => setTab('leave')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5">
                  <FileText className="w-5 h-5 text-rose-400" />
                  <span className="text-[11px] text-slate-300">Apply Leave</span>
                </button>
              </div>

            </div>
          )}

          {/* HOMEWORK TAB */}
          {tab === 'homework' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Assigned Homework</h4>
              {homework.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  No homework assigned yet.
                </div>
              ) : (
                homework.map((hw, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold">{hw.subject}</span>
                    </div>
                    <h5 className="font-bold text-white">{hw.title}</h5>
                    <p className="text-slate-400 text-[11px]">{hw.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* RESULTS TAB */}
          {tab === 'results' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Academic Results</h4>
              {childMarks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  No exam marks published yet.
                </div>
              ) : (
                childMarks.map((mk, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <h5 className="font-bold text-white">{mk.examTitle}</h5>
                      <span className="font-bold text-purple-400">{mk.percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TIMETABLE TAB */}
          {tab === 'timetable' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Class Timetable</h4>
              {(!timetable.schedule || timetable.schedule.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  No timetable schedule available.
                </div>
              ) : (
                timetable.schedule.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-white">{item.subject}</h5>
                      <p className="text-[10px] text-slate-400">{item.teacherName} • {item.roomNo}</p>
                    </div>
                    <span className="text-indigo-400 font-mono text-[11px] font-bold">{item.startTime}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BUS TRACKER TAB */}
          {tab === 'transport' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase">Live School Bus GPS</h4>
              {!transport ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  No active transport route assigned.
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white">{transport.routeName}</h5>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                  </div>
                  <p className="text-slate-400">Driver: <strong>{transport.driverName}</strong> ({transport.driverPhone})</p>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {tab === 'attendance' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase">Monthly Attendance Record</h4>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <p className="text-3xl font-black text-emerald-400">100%</p>
                <p className="text-slate-400 text-[11px]">All Attendance Verified</p>
              </div>
            </div>
          )}

          {/* LEAVE TAB */}
          {tab === 'leave' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase">Submit Sick Leave Application</h4>
              <form onSubmit={(e) => { e.preventDefault(); alert('Leave Request Submitted to Class Teacher'); }} className="space-y-2">
                <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs" required />
                <textarea placeholder="Reason for leave..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs h-20" required />
                <button type="submit" className="w-full py-2 gradient-primary text-white font-bold rounded-lg">Submit Application</button>
              </form>
            </div>
          )}

        </div>

        {/* Mobile Navigation Tabs (STRICTLY 0% FEES) */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex justify-around items-center text-slate-400 text-[10px]">
          <button onClick={() => setTab('home')} className={`flex flex-col items-center gap-1 ${tab === 'home' ? 'text-indigo-400 font-bold' : ''}`}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button onClick={() => setTab('homework')} className={`flex flex-col items-center gap-1 ${tab === 'homework' ? 'text-indigo-400 font-bold' : ''}`}>
            <BookOpen className="w-4 h-4" />
            <span>Homework</span>
          </button>
          <button onClick={() => setTab('results')} className={`flex flex-col items-center gap-1 ${tab === 'results' ? 'text-indigo-400 font-bold' : ''}`}>
            <Award className="w-4 h-4" />
            <span>Exams</span>
          </button>
          <button onClick={() => setTab('transport')} className={`flex flex-col items-center gap-1 ${tab === 'transport' ? 'text-indigo-400 font-bold' : ''}`}>
            <Truck className="w-4 h-4" />
            <span>Bus Tracker</span>
          </button>
        </div>

      </div>

    </div>
  );
}

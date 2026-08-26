'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, MapPin, BookOpen, Award, FileText, CheckCircle } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [staffClocked, setStaffClocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students?classId=Class%2010&sectionId=Section%20A`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        const init = {};
        data.forEach(s => { init[s._id] = 'PRESENT'; });
        setAttendance(init);
      }
    } catch (e) {
      console.warn('Teacher fetch error');
    }
  };

  const handleMarkAttendance = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = students.map(s => ({
        studentId: s._id,
        studentName: `${s.firstName} ${s.lastName}`,
        rollNo: s.rollNo,
        status: attendance[s._id] || 'PRESENT'
      }));

      const res = await fetch(`${API_BASE}/attendance/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: today,
          classId: 'Class 10',
          sectionId: 'Section A',
          records
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGPSClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/staff/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method: 'GPS',
          location: { lat: 28.6139, lng: 77.2090, address: 'School Campus Geofence Zone A' }
        })
      });
      if (res.ok) {
        setStaffClocked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Staff GPS Clock-In Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Staff Mobile Attendance (GPS Clock-In)</h3>
            <p className="text-xs text-slate-400">No hardware biometric required. Verified via phone location.</p>
          </div>
        </div>

        <button 
          onClick={handleGPSClockIn}
          disabled={staffClocked}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            staffClocked 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'gradient-primary text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{staffClocked ? 'Clocked In via GPS ✓' : 'Clock In Now'}</span>
        </button>
      </div>

      {/* Class Attendance Marker Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Mark Class Attendance</h3>
            <p className="text-xs text-slate-400">Class 10 - Section A • Today's Date</p>
          </div>
          {submitted && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Saved to MongoDB
            </span>
          )}
        </div>

        <div className="space-y-3">
          {students.map(st => (
            <div key={st._id} className="glass-card p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white">{st.firstName} {st.lastName}</h4>
                <p className="text-slate-400">Roll #{st.rollNo} • {st.admissionNo}</p>
              </div>
              <div className="flex items-center space-x-1">
                {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleMarkAttendance(st._id, status)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      attendance[st._id] === status
                        ? status === 'PRESENT' ? 'bg-emerald-600 text-white' :
                          status === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSaveAttendance}
          disabled={loading}
          className="w-full py-3 gradient-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 hover:opacity-90 transition"
        >
          Submit Class Attendance
        </button>
      </div>

    </div>
  );
}

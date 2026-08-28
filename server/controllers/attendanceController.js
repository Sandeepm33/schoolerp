/**
 * attendanceController.js
 * Complete School ERP Attendance Controller
 * Covers: Session management, Draft/Submit/Lock, Corrections, Calendar,
 *         Student History, Class/Section summaries, Teacher Attendance, Settings
 */
const { Student, AttendanceRecord, User } = require('../models/coreModels');
const {
  AttendanceSession,
  AttendanceCorrection,
  AttendanceSetting,
  StaffAttendance
} = require('../models/extendedModels');

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/** Map short codes to display labels */
const STATUS_LABELS = {
  P: 'Present', A: 'Absent', L: 'Late', HD: 'Half Day',
  LV: 'Leave', OD: 'Official Duty', H: 'Holiday', W: 'Weekend', NM: 'Not Marked'
};

/** Compute summary counts from entries array */
function computeSummary(entries) {
  const summary = { total: entries.length, present: 0, absent: 0, late: 0, halfDay: 0, leave: 0, od: 0, notMarked: 0 };
  entries.forEach(e => {
    if (e.status === 'P') summary.present++;
    else if (e.status === 'A') summary.absent++;
    else if (e.status === 'L') summary.late++;
    else if (e.status === 'HD') summary.halfDay++;
    else if (e.status === 'LV') summary.leave++;
    else if (e.status === 'OD') summary.od++;
    else if (e.status === 'NM' || !e.status) summary.notMarked++;
  });
  return summary;
}

/** Clean class/section strings for flexible matching */
function cleanClass(str) { return String(str || '').replace(/^Class\s+/i, '').trim(); }
function cleanSection(str) { return String(str || '').replace(/^Section\s+/i, '').trim(); }

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

/** GET /admin/attendance/settings */
const getAttendanceSettings = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    let settings = await AttendanceSetting.findOne({ schoolId });
    if (!settings) {
      settings = await AttendanceSetting.create({ schoolId });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** PUT /admin/attendance/settings */
const saveAttendanceSettings = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const updated = await AttendanceSetting.findOneAndUpdate(
      { schoolId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ message: 'Attendance settings saved.', settings: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SESSION MANAGEMENT ────────────────────────────────────────────────────────

/** GET /attendance/sessions?date=&classId=&sectionId=&type= */
/** GET /attendance/sessions?date=&classId=&sectionId=&type= */
const getSessionsForDay = async (req, res) => {
  try {
    const { date, classId, sectionId, type, periodNo, subject } = req.query;
    const schoolId = req.user?.schoolId;
    const query = {};
    if (schoolId) query.schoolId = schoolId;
    if (date) query.date = date;
    if (classId) query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    if (sectionId && sectionId !== 'ALL') query.sectionId = { $regex: new RegExp(`^(${cleanSection(sectionId)}|Section\\s*${cleanSection(sectionId)})$`, 'i') };
    if (type) query.type = type;
    if (type === 'PERIOD' && periodNo) query.periodNo = Number(periodNo);
    if (subject) query.subject = subject;
    const sessions = await AttendanceSession.find(query).sort({ classId: 1, sectionId: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET /attendance/sessions/:id */
const getSessionById = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Attendance session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /attendance/sessions/draft
 * Save (or upsert) a DRAFT attendance session — does not lock or validate.
 */
const saveDraftSession = async (req, res) => {
  try {
    const { date, classId, sectionId, type = 'DAILY', periodNo = null, subject = null, entries = [] } = req.body;
    const schoolId = req.user?.schoolId;
    const teacherName = req.user?.name || 'Teacher';
    const teacherId = req.user?._id || null;

    if (!date || !classId || !sectionId) {
      return res.status(400).json({ message: 'date, classId, sectionId are required.' });
    }

    const normClass = cleanClass(classId);
    const normSection = cleanSection(sectionId);

    const filter = {
      date,
      classId: { $regex: new RegExp(`^(${normClass}|Class\\s*${normClass})$`, 'i') },
      sectionId: { $regex: new RegExp(`^(${normSection}|Section\\s*${normSection})$`, 'i') },
      type
    };
    if (schoolId) filter.schoolId = schoolId;
    if (type === 'PERIOD' && periodNo) filter.periodNo = Number(periodNo);
    if (subject) filter.subject = subject;

    // Cannot modify a LOCKED session
    const existing = await AttendanceSession.findOne(filter);
    if (existing && existing.isLocked) {
      return res.status(409).json({ message: 'Attendance is locked. Submit a correction request to make changes.' });
    }

    const summary = computeSummary(entries);
    const sessionData = {
      date, classId: normClass, sectionId: normSection, type, periodNo, subject,
      teacherId, teacherName,
      status: 'DRAFT',
      entries,
      summary,
      markedBy: teacherId,
      markedByName: teacherName,
      isLocked: false
    };
    if (schoolId) sessionData.schoolId = schoolId;

    const session = await AttendanceSession.findOneAndUpdate(
      filter,
      sessionData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Draft saved.', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /attendance/sessions/submit
 * Validate → Submit → Lock a session.
 */
const submitSession = async (req, res) => {
  try {
    const { date, classId, sectionId, type = 'DAILY', periodNo = null, subject = null, entries = [], forceSubmitUnmarked = false } = req.body;
    const schoolId = req.user?.schoolId;
    const teacherName = req.user?.name || 'Teacher';
    const teacherId = req.user?._id || null;

    if (!date || !classId || !sectionId) {
      return res.status(400).json({ message: 'date, classId, sectionId are required.' });
    }

    const normClass = cleanClass(classId);
    const normSection = cleanSection(sectionId);

    const filter = {
      date,
      classId: { $regex: new RegExp(`^(${normClass}|Class\\s*${normClass})$`, 'i') },
      sectionId: { $regex: new RegExp(`^(${normSection}|Section\\s*${normSection})$`, 'i') },
      type
    };
    if (schoolId) filter.schoolId = schoolId;
    if (type === 'PERIOD' && periodNo) filter.periodNo = Number(periodNo);
    if (subject) filter.subject = subject;

    const existing = await AttendanceSession.findOne(filter);
    if (existing && existing.isLocked) {
      return res.status(409).json({ message: 'Attendance is already locked.' });
    }

    // Validation: find not-marked students
    const unmarked = entries.filter(e => !e.status || e.status === 'NM');
    if (unmarked.length > 0 && !forceSubmitUnmarked) {
      return res.status(422).json({
        message: `${unmarked.length} student(s) are not marked yet.`,
        unmarked: unmarked.map(e => ({ studentId: e.studentId, studentName: e.studentName, rollNo: e.rollNo })),
        requiresForce: true
      });
    }

    // If forceSubmitUnmarked, set NM → A (Absent)
    const finalEntries = entries.map(e => ({
      ...e,
      status: (!e.status || e.status === 'NM') ? 'A' : e.status
    }));

    const summary = computeSummary(finalEntries);
    const now = new Date();

    const sessionData = {
      date, classId: normClass, sectionId: normSection, type, periodNo, subject,
      teacherId, teacherName,
      status: 'LOCKED',
      submittedAt: now,
      lockedAt: now,
      entries: finalEntries,
      summary,
      markedBy: teacherId,
      markedByName: teacherName,
      isLocked: true,
      lockedBy: teacherName
    };
    if (schoolId) sessionData.schoolId = schoolId;

    const session = await AttendanceSession.findOneAndUpdate(
      filter,
      sessionData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Also sync to legacy AttendanceRecord for backward compatibility
    for (const entry of finalEntries) {
      const legacyStatus = { P: 'PRESENT', A: 'ABSENT', L: 'LATE', HD: 'PRESENT', LV: 'LEAVE', OD: 'PRESENT', NM: 'ABSENT' }[entry.status] || 'PRESENT';
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingRec = await AttendanceRecord.findOne({ studentId: entry.studentId, date: { $gte: startOfDay, $lte: endOfDay } });
      if (existingRec) {
        existingRec.status = legacyStatus;
        existingRec.markedBy = teacherName;
        await existingRec.save();
      } else {
        const student = await Student.findById(entry.studentId).catch(() => null);
        if (student) {
          await AttendanceRecord.create({
            schoolId,
            studentId: entry.studentId,
            studentName: entry.studentName,
            classId: student.classId,
            sectionId: student.sectionId,
            date: new Date(date),
            status: legacyStatus,
            markedBy: teacherName
          });
          // Update student counters
          const isPresent = ['P', 'L', 'HD', 'OD'].includes(entry.status);
          student.totalClasses = (student.totalClasses || 0) + 1;
          if (isPresent) student.totalPresent = (student.totalPresent || 0) + 1;
          const pct = Math.round(((student.totalPresent || 0) / student.totalClasses) * 100);
          student.attendancePercentage = pct;
          await student.save();
        }
      }
    }

    res.json({ message: `Attendance submitted and locked for ${classId} ${sectionId} on ${date}.`, session, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST /attendance/sessions/:id/lock — Admin can lock a submitted session */
const lockSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.isLocked = true;
    session.status = 'LOCKED';
    session.lockedAt = new Date();
    session.lockedBy = req.user?.name || 'Admin';
    await session.save();
    res.json({ message: 'Session locked.', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CALENDAR ──────────────────────────────────────────────────────────────────

/** GET /attendance/calendar?month=8&year=2026&classId=&sectionId= */
const getAttendanceCalendar = async (req, res) => {
  try {
    const { month, year, classId, sectionId } = req.query;
    const schoolId = req.user?.schoolId;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);

    // Build date range strings for the month
    const pad = n => String(n).padStart(2, '0');
    const startDate = `${y}-${pad(m)}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${pad(m)}-${pad(lastDay)}`;

    const query = { schoolId, date: { $gte: startDate, $lte: endDate }, isLocked: true };
    if (classId) query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    if (sectionId && sectionId !== 'ALL') query.sectionId = { $regex: new RegExp(`^(${cleanSection(sectionId)}|Section\\s*${cleanSection(sectionId)})$`, 'i') };

    const sessions = await AttendanceSession.find(query, 'date classId sectionId summary');

    // Group by date → compute class-wise attendance %
    const calendarMap = {};
    for (const s of sessions) {
      if (!calendarMap[s.date]) calendarMap[s.date] = [];
      const pct = s.summary.total > 0 ? Math.round(((s.summary.present + s.summary.late) / s.summary.total) * 100) : null;
      calendarMap[s.date].push({
        classId: s.classId,
        sectionId: s.sectionId,
        percentage: pct,
        summary: s.summary
      });
    }

    // Also compute per-date overall school average
    const result = {};
    for (const [date, entries] of Object.entries(calendarMap)) {
      const validEntries = entries.filter(e => e.percentage !== null);
      const avg = validEntries.length > 0
        ? Math.round(validEntries.reduce((s, e) => s + e.percentage, 0) / validEntries.length)
        : null;
      result[date] = { average: avg, classes: entries };
    }

    res.json({ month: m, year: y, calendar: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SUMMARIES ─────────────────────────────────────────────────────────────────

/** GET /attendance/class-summary?date=2026-08-27 — All classes for a given date */
const getClassWiseSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const schoolId = req.user?.schoolId;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sessions = await AttendanceSession.find({ schoolId, date: targetDate }, 'classId sectionId summary status isLocked');
    res.json({ date: targetDate, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET /attendance/section-summary?date=&classId= */
const getSectionWiseSummary = async (req, res) => {
  try {
    const { date, classId } = req.query;
    const schoolId = req.user?.schoolId;
    const query = { schoolId };
    if (date) query.date = date;
    if (classId) query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    const sessions = await AttendanceSession.find(query, 'date classId sectionId summary status isLocked entries');
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STUDENT HISTORY ───────────────────────────────────────────────────────────

/** GET /attendance/student/:studentId/history?year=2026&academicYear= */
const getStudentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear = '2026-2027' } = req.query;
    const schoolId = req.user?.schoolId;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Get all sessions containing this student
    const sessions = await AttendanceSession.find(
      {
        schoolId,
        academicYear,
        'entries.studentId': studentId,
        isLocked: true
      },
      'date classId sectionId entries'
    ).sort({ date: 1 });

    // Extract per-date records for this student
    const records = [];
    let totalWorkingDays = 0, totalPresent = 0, totalAbsent = 0, totalLate = 0, totalLeave = 0;

    for (const session of sessions) {
      const entry = session.entries.find(e => String(e.studentId) === String(studentId));
      if (entry) {
        totalWorkingDays++;
        if (entry.status === 'P') totalPresent++;
        else if (entry.status === 'A') totalAbsent++;
        else if (entry.status === 'L') totalLate++;
        else if (['LV', 'OD'].includes(entry.status)) totalLeave++;
        records.push({
          date: session.date,
          status: entry.status,
          statusLabel: STATUS_LABELS[entry.status] || entry.status,
          remarks: entry.remarks,
          classId: session.classId,
          sectionId: session.sectionId
        });
      }
    }

    const attendancePercentage = totalWorkingDays > 0
      ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100)
      : student.attendancePercentage || 0;

    // Monthly breakdown
    const monthlyMap = {};
    for (const rec of records) {
      const [y, mo] = rec.date.split('-');
      const key = `${y}-${mo}`;
      if (!monthlyMap[key]) monthlyMap[key] = { workingDays: 0, present: 0, absent: 0, late: 0, leave: 0 };
      monthlyMap[key].workingDays++;
      if (rec.status === 'P') monthlyMap[key].present++;
      else if (rec.status === 'A') monthlyMap[key].absent++;
      else if (rec.status === 'L') monthlyMap[key].late++;
      else if (['LV', 'OD'].includes(rec.status)) monthlyMap[key].leave++;
    }

    const monthlyBreakdown = Object.entries(monthlyMap).map(([key, v]) => ({
      month: key,
      ...v,
      percentage: v.workingDays > 0 ? Math.round(((v.present + v.late) / v.workingDays) * 100) : 0
    }));

    res.json({
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        classId: student.classId,
        sectionId: student.sectionId
      },
      academicYear,
      summary: { totalWorkingDays, totalPresent, totalAbsent, totalLate, totalLeave, attendancePercentage },
      monthlyBreakdown,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOW ATTENDANCE ────────────────────────────────────────────────────────────

/** GET /attendance/low-attendance?threshold=75&classId= */
const getLowAttendanceList = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const threshold = parseInt(req.query.threshold) || 75;
    const { classId } = req.query;

    const query = { schoolId, attendancePercentage: { $lt: threshold } };
    if (classId) {
      query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    }

    const students = await Student.find(query, 'firstName lastName admissionNo rollNo classId sectionId attendancePercentage totalPresent totalClasses')
      .sort({ attendancePercentage: 1 });

    res.json({ threshold, count: students.length, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── TEACHER ATTENDANCE ────────────────────────────────────────────────────────

/** GET /attendance/teacher?date= */
const getTeacherAttendance = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const records = await StaffAttendance.find({ schoolId, date }).sort({ staffName: 1 });
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      leave: records.filter(r => r.status === 'ON_LEAVE').length
    };
    res.json({ date, summary, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST /attendance/teacher — Bulk mark teacher attendance */
const markTeacherAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const schoolId = req.user?.schoolId;
    if (!Array.isArray(records)) return res.status(400).json({ message: 'records array required' });

    const saved = [];
    for (const rec of records) {
      const existing = await StaffAttendance.findOne({ schoolId, date, staffId: rec.staffId });
      if (existing) {
        Object.assign(existing, rec);
        await existing.save();
        saved.push(existing);
      } else {
        const created = await StaffAttendance.create({ schoolId, date, ...rec });
        saved.push(created);
      }
    }
    res.json({ message: `Teacher attendance saved for ${saved.length} staff.`, count: saved.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST /attendance/staff/clock-in — Teacher self clock-in (legacy compat) */
const clockInStaff = async (req, res) => {
  try {
    const { method = 'GPS', location } = req.body;
    const schoolId = req.user?.schoolId;
    const userId = req.user?._id;
    const staffName = req.user?.name || 'Staff';
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().slice(0, 5);

    const existing = await StaffAttendance.findOne({ schoolId, staffId: userId, date: today });
    if (existing) {
      return res.json({ message: 'Already clocked in.', record: existing });
    }

    const record = await StaffAttendance.create({
      schoolId, date: today, staffId: userId, staffName,
      checkIn: checkInTime, method, location,
      status: 'PRESENT'
    });
    res.json({ message: `Clocked in at ${checkInTime}.`, record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── MONTHLY REPORT ────────────────────────────────────────────────────────────

/** GET /attendance/reports/monthly?classId=&sectionId=&month=8&year=2026 */
const getMonthlyReport = async (req, res) => {
  try {
    const { classId, sectionId, month, year } = req.query;
    const schoolId = req.user?.schoolId;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const pad = n => String(n).padStart(2, '0');
    const startDate = `${y}-${pad(m)}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${pad(m)}-${pad(lastDay)}`;

    const query = { schoolId, date: { $gte: startDate, $lte: endDate }, isLocked: true };
    if (classId) query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    if (sectionId && sectionId !== 'ALL') query.sectionId = { $regex: new RegExp(`^(${cleanSection(sectionId)}|Section\\s*${cleanSection(sectionId)})$`, 'i') };

    const sessions = await AttendanceSession.find(query);

    // Build per-student report
    const studentMap = {};
    for (const session of sessions) {
      for (const entry of session.entries) {
        const sid = String(entry.studentId);
        if (!studentMap[sid]) {
          studentMap[sid] = {
            studentId: sid, studentName: entry.studentName, rollNo: entry.rollNo,
            workingDays: 0, present: 0, absent: 0, late: 0, leave: 0, od: 0, halfDay: 0
          };
        }
        studentMap[sid].workingDays++;
        if (entry.status === 'P') studentMap[sid].present++;
        else if (entry.status === 'A') studentMap[sid].absent++;
        else if (entry.status === 'L') studentMap[sid].late++;
        else if (entry.status === 'LV') studentMap[sid].leave++;
        else if (entry.status === 'OD') studentMap[sid].od++;
        else if (entry.status === 'HD') studentMap[sid].halfDay++;
      }
    }

    const report = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.workingDays > 0 ? Math.round(((s.present + s.late) / s.workingDays) * 100) : 0
    })).sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true }));

    const totalWorkingDays = sessions.length > 0 ? Math.max(...report.map(r => r.workingDays), 0) : 0;
    res.json({ month: m, year: y, classId, sectionId, totalWorkingDays, studentCount: report.length, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CORRECTIONS ───────────────────────────────────────────────────────────────

/** POST /attendance/corrections */
const submitCorrectionRequest = async (req, res) => {
  try {
    const { sessionId, date, classId, sectionId, studentId, studentName, rollNo, oldStatus, newStatus, reason } = req.body;
    const schoolId = req.user?.schoolId;

    if (!sessionId || !studentId || !newStatus || !reason) {
      return res.status(400).json({ message: 'sessionId, studentId, newStatus, reason are required.' });
    }

    const correction = await AttendanceCorrection.create({
      schoolId, sessionId, date, classId, sectionId,
      studentId, studentName, rollNo,
      oldStatus, newStatus, reason,
      requestedBy: req.user?._id,
      requestedByName: req.user?.name,
      requestedByRole: req.user?.role,
      auditLog: [{
        action: 'REQUESTED',
        by: req.user?.name,
        byRole: req.user?.role,
        note: `Correction requested: ${oldStatus} → ${newStatus}. Reason: ${reason}`
      }]
    });
    res.status(201).json({ message: 'Correction request submitted. Awaiting admin review.', correction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET /attendance/corrections?status=PENDING&classId= */
const getCorrectionRequests = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const { status, classId } = req.query;
    const query = { schoolId };
    if (status) query.status = status;
    if (classId) query.classId = classId;
    const corrections = await AttendanceCorrection.find(query).sort({ createdAt: -1 });
    res.json(corrections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** PATCH /attendance/corrections/:id — Admin approves or rejects */
const approveCorrectionRequest = async (req, res) => {
  try {
    const { action, adminRemarks } = req.body; // action: 'APPROVE' | 'REJECT'
    const correction = await AttendanceCorrection.findById(req.params.id);
    if (!correction) return res.status(404).json({ message: 'Correction request not found.' });

    const adminName = req.user?.name || 'Admin';
    const now = new Date();

    if (action === 'APPROVE') {
      const extractId = (id) => typeof id === 'object' ? String(id?._id || id?.id || id) : String(id);
      const stId = extractId(correction.studentId);
      const normClass = cleanClass(correction.classId);
      const normSection = cleanSection(correction.sectionId);

      // 1. Find session by sessionId OR by (date, classId, sectionId)
      let session = null;
      if (correction.sessionId) {
        session = await AttendanceSession.findById(correction.sessionId);
      }
      if (!session) {
        session = await AttendanceSession.findOne({
          date: correction.date,
          classId: { $regex: new RegExp(`^(${normClass}|Class\\s*${normClass})$`, 'i') },
          sectionId: { $regex: new RegExp(`^(${normSection}|Section\\s*${normSection})$`, 'i') }
        });
      }

      if (session && Array.isArray(session.entries)) {
        const entry = session.entries.find(e => {
          const eId = extractId(e.studentId);
          return (
            (eId && stId && eId === stId) ||
            (e.rollNo && correction.rollNo && String(e.rollNo).trim() === String(correction.rollNo).trim()) ||
            (e.studentName && correction.studentName && String(e.studentName).trim().toLowerCase() === String(correction.studentName).trim().toLowerCase())
          );
        });
        if (entry) {
          entry.status = correction.newStatus;
          entry.remarks = `Corrected by ${adminName}: ${adminRemarks || correction.reason || ''}`;
          session.summary = computeSummary(session.entries);
          session.markModified('entries');
          await session.save();
        }
      }

      // 2. Safely update legacy AttendanceRecord with distinct Date instances
      const legacyStatus = { P: 'PRESENT', A: 'ABSENT', L: 'LATE', HD: 'PRESENT', LV: 'LEAVE', OD: 'PRESENT', NM: 'ABSENT' }[correction.newStatus] || 'PRESENT';
      const targetDate = correction.date ? new Date(correction.date) : new Date();
      const d1 = new Date(targetDate); d1.setHours(0, 0, 0, 0);
      const d2 = new Date(targetDate); d2.setHours(23, 59, 59, 999);

      await AttendanceRecord.findOneAndUpdate(
        { studentId: stId, date: { $gte: d1, $lte: d2 } },
        { status: legacyStatus, markedBy: adminName },
        { new: true, upsert: true }
      );

      // 3. Recalculate Student's overall attendance totals
      const student = await Student.findById(stId);
      if (student) {
        const studentRecords = await AttendanceRecord.find({ studentId: stId });
        const totalClasses = studentRecords.length;
        const totalPresent = studentRecords.filter(r => ['PRESENT', 'LATE'].includes(r.status)).length;
        student.totalClasses = totalClasses;
        student.totalPresent = totalPresent;
        student.attendancePercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
        await student.save();
      }

      correction.status = 'APPROVED';
    } else {
      correction.status = 'REJECTED';
    }

    correction.reviewedBy = adminName;
    correction.reviewedAt = now;
    correction.adminRemarks = adminRemarks;
    correction.auditLog.push({
      action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      by: adminName,
      byRole: req.user?.role,
      note: adminRemarks || ''
    });
    await correction.save();

    res.json({ message: `Correction ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`, correction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LEGACY COMPAT (keep old routes working) ───────────────────────────────────

/** GET /admin/attendance/students — legacy admin view */
const getStudentAttendance = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const { classId, sectionId, date } = req.query;
    const query = {};
    if (schoolId) query.schoolId = schoolId;
    if (classId) query.classId = { $regex: new RegExp(`^(${cleanClass(classId)}|Class\\s*${cleanClass(classId)})$`, 'i') };
    if (sectionId && sectionId !== 'ALL') query.sectionId = { $regex: new RegExp(`^(${cleanSection(sectionId)}|Section\\s*${cleanSection(sectionId)})$`, 'i') };
    if (date) {
      const d1 = new Date(date);
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(date);
      d2.setHours(23, 59, 59, 999);
      query.date = { $gte: d1, $lte: d2 };
    }
    const records = await AttendanceRecord.find(query).sort({ date: -1 }).limit(500);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST /admin/attendance/students — legacy mark (supports single & bulk array) */
const markStudentAttendance = async (req, res) => {
  try {
    const { studentId, status, date, records, entries } = req.body;
    const recList = Array.isArray(records) ? records : Array.isArray(entries) ? entries : null;

    if (recList) {
      const results = [];
      const targetDate = date ? new Date(date) : new Date();
      const d1 = new Date(targetDate); d1.setHours(0, 0, 0, 0);
      const d2 = new Date(targetDate); d2.setHours(23, 59, 59, 999);

      for (const item of recList) {
        const sid = item.studentId || item._id;
        const stStatus = item.status === 'P' ? 'PRESENT' : item.status === 'A' ? 'ABSENT' : item.status === 'L' ? 'LATE' : item.status === 'LV' ? 'LEAVE' : (item.status || 'PRESENT');
        if (!sid) continue;
        const student = await Student.findById(sid);
        if (student) {
          const updateData = {
            studentId: sid,
            studentName: `${student.firstName} ${student.lastName}`,
            classId: student.classId,
            sectionId: student.sectionId,
            date: targetDate,
            status: stStatus,
            markedBy: req.user?.name || 'Admin'
          };
          if (req.user?.schoolId) updateData.schoolId = req.user.schoolId;

          const rec = await AttendanceRecord.findOneAndUpdate(
            { studentId: sid, date: { $gte: d1, $lte: d2 } },
            updateData,
            { new: true, upsert: true }
          );
          results.push(rec);
        }
      }
      return res.json({ message: 'Attendance updated', count: results.length, records: results });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const targetDate = date ? new Date(date) : new Date();
    const d1 = new Date(targetDate); d1.setHours(0, 0, 0, 0);
    const d2 = new Date(targetDate); d2.setHours(23, 59, 59, 999);

    const updateData = {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      classId: student.classId,
      sectionId: student.sectionId,
      date: targetDate,
      status,
      markedBy: req.user?.name || 'Admin'
    };
    if (req.user?.schoolId) updateData.schoolId = req.user.schoolId;

    const rec = await AttendanceRecord.findOneAndUpdate(
      { studentId, date: { $gte: d1, $lte: d2 } },
      updateData,
      { new: true, upsert: true }
    );
    res.json(rec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DASHBOARD SUMMARY ─────────────────────────────────────────────────────────

/** GET /attendance/dashboard?date= — Today's full school attendance dashboard for ALL DYNAMIC classes */
const getAttendanceDashboard = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const sessQuery = { date };
    if (schoolId) sessQuery.schoolId = schoolId;

    // 1. Get all today's sessions
    const sessions = await AttendanceSession.find(sessQuery);

    const classMap = {};

    // 2. Fetch active ClassRoom documents (configured classes in school)
    try {
      const { ClassRoom } = require('../models/extendedModels');
      const roomQuery = { isActive: true };
      if (schoolId) roomQuery.schoolId = schoolId;
      const classRooms = await ClassRoom.find(roomQuery);
      classRooms.forEach(room => {
        const cId = cleanClass(room.className || room.name || '');
        const sId = cleanSection(room.section || room.sectionId || 'A');
        if (cId) {
          const key = `${cId}_${sId}`;
          classMap[key] = {
            classId: cId,
            sectionId: sId,
            status: 'UNMARKED',
            isLocked: false,
            summary: { total: room.capacity || 0, present: 0, absent: 0, late: 0, leave: 0, notMarked: 0 },
            percentage: 0
          };
        }
      });
    } catch (e) {}

    // 3. Fetch all distinct class & section pairs from Students in database
    const studentMatch = schoolId ? { schoolId } : {};
    const classSectionPairs = await Student.aggregate([
      { $match: studentMatch },
      { $group: { _id: { classId: '$classId', sectionId: '$sectionId' }, count: { $sum: 1 } } }
    ]);

    classSectionPairs.forEach(pair => {
      const cId = cleanClass(pair._id?.classId || '');
      const sId = cleanSection(pair._id?.sectionId || 'A');
      if (cId) {
        const key = `${cId}_${sId}`;
        const existing = classMap[key];
        classMap[key] = {
          classId: cId,
          sectionId: sId,
          status: existing?.status || 'UNMARKED',
          isLocked: existing?.isLocked || false,
          summary: { total: pair.count, present: 0, absent: 0, late: 0, leave: 0, notMarked: pair.count },
          percentage: 0
        };
      }
    });

    // 4. Overlay today's actual AttendanceSessions (submitted/draft)
    sessions.forEach(s => {
      const normC = cleanClass(s.classId);
      const normS = cleanSection(s.sectionId);
      const key = `${normC}_${normS}`;

      const total = s.summary?.total || s.entries?.length || 0;
      const present = s.summary?.present || s.entries?.filter(e => e.status === 'P' || e.status === 'PRESENT').length || 0;
      const absent = s.summary?.absent || s.entries?.filter(e => e.status === 'A' || e.status === 'ABSENT').length || 0;
      const late = s.summary?.late || s.entries?.filter(e => e.status === 'L' || e.status === 'LATE').length || 0;
      const leave = s.summary?.leave || s.entries?.filter(e => ['LV', 'OD', 'LEAVE'].includes(e.status)).length || 0;
      const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      classMap[key] = {
        classId: normC,
        sectionId: normS,
        status: s.status || (s.isLocked ? 'LOCKED' : 'DRAFT'),
        isLocked: !!s.isLocked,
        summary: { total, present, absent, late, leave, notMarked: Math.max(0, total - (present + absent + late + leave)) },
        percentage: pct
      };
    });

    // 5. Overlay legacy AttendanceRecord table for any un-sessioned classes
    const recQuery = { date: { $gte: new Date(date + 'T00:00:00.000Z'), $lte: new Date(date + 'T23:59:59.999Z') } };
    if (schoolId) recQuery.schoolId = schoolId;
    const legacyRecords = await AttendanceRecord.find(recQuery);
    if (legacyRecords.length > 0) {
      const groupedLegacy = {};
      legacyRecords.forEach(r => {
        const cId = cleanClass(r.classId || 'LKG');
        const sId = cleanSection(r.sectionId || 'A');
        const k = `${cId}_${sId}`;
        if (!groupedLegacy[k]) groupedLegacy[k] = { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
        groupedLegacy[k].total += 1;
        if (r.status === 'PRESENT') groupedLegacy[k].present += 1;
        else if (r.status === 'ABSENT') groupedLegacy[k].absent += 1;
        else if (r.status === 'LATE') groupedLegacy[k].late += 1;
        else if (r.status === 'LEAVE') groupedLegacy[k].leave += 1;
      });

      Object.keys(groupedLegacy).forEach(k => {
        if (!classMap[k] || classMap[k].status === 'UNMARKED') {
          const g = groupedLegacy[k];
          const pct = g.total > 0 ? Math.round(((g.present + g.late) / g.total) * 100) : 0;
          const [cId, sId] = k.split('_');
          classMap[k] = {
            classId: cId,
            sectionId: sId,
            status: 'LOCKED',
            isLocked: true,
            summary: { total: g.total, present: g.present, absent: g.absent, late: g.late, leave: g.leave, notMarked: 0 },
            percentage: pct
          };
        }
      });
    }

    const classWise = Object.values(classMap).sort((a, b) => `${a.classId}-${a.sectionId}`.localeCompare(`${b.classId}-${b.sectionId}`));

    // Overall School Student Summary
    const totalStudentsInSchool = await Student.countDocuments(studentMatch);
    let totalPresent = 0, totalAbsent = 0, totalLate = 0, totalLeave = 0;

    classWise.forEach(c => {
      totalPresent += c.summary.present || 0;
      totalAbsent += c.summary.absent || 0;
      totalLate += c.summary.late || 0;
      totalLeave += c.summary.leave || 0;
    });

    const studentSummary = {
      total: Math.max(totalStudentsInSchool, totalPresent + totalAbsent + totalLate + totalLeave),
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      leave: totalLeave
    };

    // Teacher Attendance
    const teacherQuery = { date };
    if (schoolId) teacherQuery.schoolId = schoolId;
    const teacherRecords = await StaffAttendance.find(teacherQuery);
    const teacherSummary = {
      total: teacherRecords.length,
      present: teacherRecords.filter(r => r.status === 'PRESENT').length,
      absent: teacherRecords.filter(r => r.status === 'ABSENT').length,
      late: teacherRecords.filter(r => r.status === 'LATE').length,
      leave: teacherRecords.filter(r => r.status === 'ON_LEAVE').length
    };

    // Threshold & Alerts
    const setQuery = {};
    if (schoolId) setQuery.schoolId = schoolId;
    const settings = await AttendanceSetting.findOne(setQuery);
    const threshold = settings?.lowAttendanceThreshold || 75;

    const stQuery = { attendancePercentage: { $lt: threshold } };
    if (schoolId) stQuery.schoolId = schoolId;
    const lowCount = await Student.countDocuments(stQuery);

    const corrQuery = { status: 'PENDING' };
    if (schoolId) corrQuery.schoolId = schoolId;
    const pendingCorrections = await AttendanceCorrection.countDocuments(corrQuery);

    res.json({ date, studentSummary, teacherSummary, classWise, lowAttendanceCount: lowCount, threshold, pendingCorrections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Settings
  getAttendanceSettings,
  saveAttendanceSettings,
  // Sessions
  getSessionsForDay,
  getSessionById,
  saveDraftSession,
  submitSession,
  lockSession,
  // Calendar & summaries
  getAttendanceCalendar,
  getClassWiseSummary,
  getSectionWiseSummary,
  // Student
  getStudentHistory,
  getLowAttendanceList,
  // Teacher
  getTeacherAttendance,
  markTeacherAttendance,
  clockInStaff,
  // Reports
  getMonthlyReport,
  // Corrections
  submitCorrectionRequest,
  getCorrectionRequests,
  approveCorrectionRequest,
  // Dashboard
  getAttendanceDashboard,
  // Legacy admin compat
  getStudentAttendance,
  markStudentAttendance,
};

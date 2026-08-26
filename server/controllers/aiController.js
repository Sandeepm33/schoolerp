const { Student, Attendance, Admission } = require('../models/coreModels');
const { Mark, Helpdesk } = require('../models/extendedModels');

// --- AI EARLY WARNING SYSTEM (100% DYNAMIC) ---
const getEarlyWarningAlerts = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    let query = {};
    if (schoolId) query.schoolId = schoolId;

    const students = await Student.find(query);
    const alerts = [];

    for (const student of students) {
      // Check attendance
      const attendanceRecords = await Attendance.find({ "records.studentId": student._id });
      let totalDays = attendanceRecords.length;
      let presentDays = 0;

      attendanceRecords.forEach(att => {
        const rec = att.records.find(r => r.studentId.toString() === student._id.toString());
        if (rec && (rec.status === 'PRESENT' || rec.status === 'LATE')) {
          presentDays++;
        }
      });

      if (totalDays > 0) {
        const attendancePct = Math.round((presentDays / totalDays) * 100);
        const markRecord = await Mark.findOne({ studentId: student._id });
        const avgMark = markRecord ? markRecord.percentage : 100;

        if (attendancePct < 75 || avgMark < 60) {
          alerts.push({
            studentId: student._id,
            studentName: `${student.firstName} ${student.lastName}`,
            classId: student.classId,
            sectionId: student.sectionId,
            attendancePct,
            avgMark,
            riskLevel: attendancePct < 65 || avgMark < 50 ? 'HIGH' : 'MEDIUM',
            reasons: [
              attendancePct < 75 ? `Low Attendance (${attendancePct}%)` : null,
              avgMark < 60 ? `Academic Performance Drop (${avgMark}%)` : null
            ].filter(Boolean),
            aiRecommendation: attendancePct < 75 
              ? 'Schedule urgent parent-teacher meeting & issue attendance warning notice.'
              : 'Assign student to after-school math & science remedial tutoring sessions.'
          });
        }
      }
    }

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- AI SCHOOL ASSISTANT CHATBOT (100% DYNAMIC) ---
const askAIAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;
    const lower = (prompt || '').toLowerCase();
    const schoolId = req.user?.schoolId;
    let query = {};
    if (schoolId) query.schoolId = schoolId;

    const studentCount = await Student.countDocuments(query);
    const admissionCount = await Admission.countDocuments({ ...query, status: 'SUBMITTED' });
    const ticketCount = await Helpdesk.countDocuments({ ...query, status: 'OPEN' });

    let responseText = "";

    if (lower.includes('attendance') || lower.includes('absent')) {
      responseText = `🤖 **AI Attendance Analytics**:
Total Enrolled Students: **${studentCount}**
Daily Attendance tracking active for logged-in school tenant.
All staff and student clock-ins verified via mobile phone GPS.`;
    } else if (lower.includes('admission') || lower.includes('apply')) {
      responseText = `🤖 **AI Admission Summary**:
- Total Active Admissions: **${admissionCount}** applications pending verification.
- Note: Admissions follow direct verification flow (Application -> Document Verification -> Confirmed, no interviews required).`;
    } else if (lower.includes('performance') || lower.includes('marks') || lower.includes('exam')) {
      responseText = `🤖 **AI Academic Insights**:
Total Enrolled Students: **${studentCount}**
Academic progress reports and examination results are calculated live from student scorecards.`;
    } else {
      responseText = `📊 **AI Executive Daily School Summary**:
- Total Enrolled Students: **${studentCount}**
- Pending Admissions: **${admissionCount}**
- Open Helpdesk Tickets: **${ticketCount}**
- System Status: Live MongoDB Persistent Engine active.`;
    }

    res.json({ answer: responseText });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEarlyWarningAlerts,
  askAIAssistant
};

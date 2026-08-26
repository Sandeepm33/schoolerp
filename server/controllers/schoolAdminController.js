/**
 * schoolAdminController.js
 * Full CRUD handlers for all 58 School Admin modules.
 */

const { Student, FeeStructure: OldFeeStructure, StudentFee, User, AttendanceRecord } = require('../models/coreModels');
const bcrypt = require('bcryptjs');

const {
  Timetable, Exam, Mark, Homework, LMSContent,
  Transport, Inventory, StaffHRMS, Certificate, Helpdesk,
  AcademicYear, ClassRoom, Subject, Department, Designation,
  LeaveType, LeaveRequest, Payroll,
  LibraryBook, LibraryTransaction,
  HostelRoom, HostelAllocation,
  HealthRecord, Discipline,
  Event, Visitor, Announcement,
  FeeCategory, FeeStructure,
  SchoolAuditLog, StaffAttendance,
} = require('../models/extendedModels');

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────
const getSchoolId = (req) => req.user?.schoolId || null;

const logAudit = async (req, action, module, recordId = null, oldVal = null, newVal = null) => {
  try {
    await SchoolAuditLog.create({
      schoolId: getSchoolId(req),
      userId: req.user?.id,
      userName: req.user?.name,
      action,
      module,
      recordId: recordId?.toString(),
      oldValue: oldVal,
      newValue: newVal,
      ipAddress: req.ip,
    });
  } catch (_) { /* non-critical */ }
};

const ok = (res, data, status = 200) => res.status(status).json(data);
const err = (res, message, status = 500) => res.status(status).json({ message });

// ─────────────────────────────────────────────────────────
// 1. ACADEMIC YEAR
// ─────────────────────────────────────────────────────────
const getAcademicYears = async (req, res) => {
  try {
    const docs = await AcademicYear.find({ schoolId: getSchoolId(req) }).sort({ startDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createAcademicYear = async (req, res) => {
  try {
    const doc = await AcademicYear.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateAcademicYear = async (req, res) => {
  try {
    const doc = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteAcademicYear = async (req, res) => {
  try {
    await AcademicYear.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted successfully' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 2. CLASS MANAGEMENT
// ─────────────────────────────────────────────────────────
const getClasses = async (req, res) => {
  try {
    const docs = await ClassRoom.find({ schoolId: getSchoolId(req), isActive: true }).sort({ className: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createClass = async (req, res) => {
  try {
    const doc = await ClassRoom.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateClass = async (req, res) => {
  try {
    const doc = await ClassRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteClass = async (req, res) => {
  try {
    await ClassRoom.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived successfully' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 3. SUBJECTS
// ─────────────────────────────────────────────────────────
const getSubjects = async (req, res) => {
  try {
    const docs = await Subject.find({ schoolId: getSchoolId(req), isActive: true }).sort({ subjectName: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createSubject = async (req, res) => {
  try {
    const doc = await Subject.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateSubject = async (req, res) => {
  try {
    const doc = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived successfully' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 4. DEPARTMENTS & DESIGNATIONS
// ─────────────────────────────────────────────────────────
const getDepartments = async (req, res) => {
  try {
    const docs = await Department.find({ schoolId: getSchoolId(req), isActive: true });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createDepartment = async (req, res) => {
  try {
    const doc = await Department.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateDepartment = async (req, res) => {
  try {
    const doc = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

const getDesignations = async (req, res) => {
  try {
    const docs = await Designation.find({ schoolId: getSchoolId(req), isActive: true });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createDesignation = async (req, res) => {
  try {
    const doc = await Designation.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateDesignation = async (req, res) => {
  try {
    const doc = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteDesignation = async (req, res) => {
  try {
    await Designation.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 5. STUDENT MANAGEMENT (CRUD + PROMOTE + ARCHIVE)
// ─────────────────────────────────────────────────────────
const getStudentList = async (req, res) => {
  try {
    const { classId, sectionId, search, status } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }
    const docs = await Student.find(query).sort({ firstName: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};

const createStudentRecord = async (req, res) => {
  try {
    const doc = await Student.create({ ...req.body, schoolId: getSchoolId(req) });
    await logAudit(req, 'CREATE', 'Student', doc._id, null, doc);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};

const updateStudentRecord = async (req, res) => {
  try {
    const old = await Student.findById(req.params.id);
    const doc = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'UPDATE', 'Student', doc._id, old, doc);
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

const deleteStudentRecord = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Student deleted' });
  } catch (e) { err(res, e.message); }
};

const promoteStudents = async (req, res) => {
  try {
    const { studentIds, newClass, newSection, newAcademicYear } = req.body;
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { classId: newClass, sectionId: newSection } }
    );
    ok(res, { message: `${studentIds.length} students promoted to ${newClass} - ${newSection}` });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 5b. ROLL NUMBER GENERATION
// ─────────────────────────────────────────────────────────
// Format: Class 5, Section A → 5A01, 5A02 ...
//         Class 5, Section B → 5B01, 5B02 ...
//         Class 5, No section → 501, 502 ...
const generateRollNo = async (classId, sectionId, schoolId) => {
  const noSection = !sectionId || sectionId.trim() === '' || sectionId.trim() === '-';
  const classNum = (classId || '').replace(/\D/g, '') || classId; // extract digits
  const sectionLabel = noSection ? '' : (sectionId || '').trim().toUpperCase().charAt(0);

  const query = { classId };
  if (!noSection) query.sectionId = sectionId;
  if (schoolId) query.schoolId = schoolId;

  const count = await Student.countDocuments(query);
  const seq = String(count + 1).padStart(2, '0');
  return noSection ? `${classNum}${seq}` : `${classNum}${sectionLabel}${seq}`;
};

const previewNextRollNo = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    if (!classId) return err(res, 'classId is required', 400);
    const rollNo = await generateRollNo(classId, sectionId, getSchoolId(req));
    ok(res, { rollNo });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 5c. ENROLL STUDENT WITH STUDENT + PARENT ACCOUNTS
// ─────────────────────────────────────────────────────────
const enrollStudentWithAccounts = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      firstName, lastName, dob, gender, bloodGroup, address,
      classId, sectionId,
      admissionNo: providedAdmNo,
      rollNo: providedRollNo,
      // Student login
      studentEmail: providedStudentEmail,
      studentPassword,
      // Parent details
      parentName, parentPhone, parentEmail, parentPassword
    } = req.body;

    if (!firstName || !lastName || !classId) {
      return err(res, 'firstName, lastName, and classId are required', 400);
    }
    if (!parentEmail) {
      return err(res, 'Parent email is required', 400);
    }

    // --- Generate roll number ---
    const rollNo = providedRollNo || (await generateRollNo(classId, sectionId, schoolId));

    // --- Generate admission number ---
    const count = await Student.countDocuments();
    const admissionNo = providedAdmNo || `ADM-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    // --- Build student email ---
    const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
    const autoStudentEmail = `${cleanFirst}.${rollNo.toLowerCase()}@school.erp`;
    const studentEmail = (providedStudentEmail || autoStudentEmail).toLowerCase().trim();

    // --- Check for duplicate emails ---
    const existingStudentUser = await User.findOne({ email: studentEmail });
    if (existingStudentUser) {
      return err(res, `Student login email '${studentEmail}' is already in use. Please provide a unique email.`, 400);
    }
    const existingParentUser = await User.findOne({ email: parentEmail.toLowerCase().trim() });
    if (existingParentUser && existingParentUser.role !== 'PARENT') {
      return err(res, `Email '${parentEmail}' is already registered under a different role.`, 400);
    }

    // --- Create Student record first ---
    const studentDoc = await Student.create({
      schoolId,
      firstName,
      lastName,
      admissionNo,
      rollNo,
      classId,
      sectionId: sectionId || '-',
      dob: dob || null,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      parentEmail: (parentEmail || '').toLowerCase().trim(),
      studentEmail,
      attendancePercentage: 0,
      totalPresent: 0,
      totalClasses: 0,
    });

    // --- Create Student login user ---
    const hashedStudentPass = await bcrypt.hash(studentPassword || 'student123', 10);
    const studentUser = await User.create({
      schoolId,
      name: `${firstName} ${lastName}`,
      email: studentEmail,
      password: hashedStudentPass,
      role: 'STUDENT',
      phone: '',
      status: 'ACTIVE',
    });

    // --- Create or reuse Parent login user ---
    let parentUser = existingParentUser;
    if (!parentUser) {
      const hashedParentPass = await bcrypt.hash(parentPassword || 'parent123', 10);
      parentUser = await User.create({
        schoolId,
        name: parentName || `Parent of ${firstName}`,
        email: parentEmail.toLowerCase().trim(),
        password: hashedParentPass,
        role: 'PARENT',
        phone: parentPhone || '',
        mappedStudentId: studentDoc._id,
        status: 'ACTIVE',
      });
    } else {
      // Update existing parent's mappedStudentId if not already set
      if (!parentUser.mappedStudentId) {
        await User.findByIdAndUpdate(parentUser._id, { mappedStudentId: studentDoc._id });
      }
    }

    // --- Link back: update student with parentId and studentUserId ---
    await Student.findByIdAndUpdate(studentDoc._id, {
      parentId: parentUser._id,
      studentUserId: studentUser._id,
    });

    await logAudit(req, 'ENROLL', 'Student', studentDoc._id, null, { firstName, lastName, rollNo, admissionNo });

    ok(res, {
      message: `Student ${firstName} ${lastName} enrolled successfully!`,
      student: { ...studentDoc.toObject(), studentUserId: studentUser._id, parentId: parentUser._id },
      credentials: {
        student: {
          name: `${firstName} ${lastName}`,
          email: studentEmail,
          password: studentPassword || 'student123',
          rollNo,
          admissionNo,
        },
        parent: {
          name: parentName || `Parent of ${firstName}`,
          email: parentEmail.toLowerCase().trim(),
          password: parentPassword || 'parent123',
        },
      },
    }, 201);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 6. STAFF / EMPLOYEE MANAGEMENT
// ─────────────────────────────────────────────────────────
const getEmployees = async (req, res) => {
  try {
    const { employeeType, department, search } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (employeeType) query.employeeType = employeeType;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const docs = await StaffHRMS.find(query).sort({ name: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createEmployee = async (req, res) => {
  try {
    const data = { ...req.body, schoolId: getSchoolId(req) };
    if (!data.employeeId) {
      const count = await StaffHRMS.countDocuments({ schoolId: getSchoolId(req) });
      data.employeeId = `EMP${String(count + 1001).padStart(5, '0')}`;
    }
    if (!data.netSalary) {
      data.netSalary = (data.basicSalary || 0) + (data.allowances || 0) - (data.deductions || 0);
    }
    const doc = await StaffHRMS.create(data);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateEmployee = async (req, res) => {
  try {
    const doc = await StaffHRMS.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteEmployee = async (req, res) => {
  try {
    await StaffHRMS.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Employee archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 7. STUDENT ATTENDANCE
// ─────────────────────────────────────────────────────────
const getStudentAttendance = async (req, res) => {
  try {
    const { date, classId, sectionId, studentId } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (date) query.date = date;
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (studentId) query.studentId = studentId;
    const docs = await AttendanceRecord.find(query).sort({ date: -1 }).limit(500);
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};

const markStudentAttendance = async (req, res) => {
  try {
    const { date, classId, sectionId, records } = req.body;
    const results = [];
    for (const r of records) {
      const filter = { schoolId: getSchoolId(req), date, studentId: r.studentId, classId, sectionId };
      const update = { ...filter, studentName: r.studentName, status: r.status, markedAt: new Date(), markedBy: req.user?.name || 'Admin' };
      const doc = await AttendanceRecord.findOneAndUpdate(filter, update, { upsert: true, new: true });
      // update student's percentage counter
      await Student.findByIdAndUpdate(r.studentId, {
        $inc: {
          totalClasses: 1,
          totalPresent: r.status === 'PRESENT' ? 1 : 0
        }
      });
      results.push(doc);
    }
    ok(res, { message: `${results.length} records saved`, results });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 8. STAFF ATTENDANCE
// ─────────────────────────────────────────────────────────
const getStaffAttendance = async (req, res) => {
  try {
    const { date, department } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (date) query.date = date;
    if (department) query.department = department;
    const docs = await StaffAttendance.find(query).sort({ date: -1 }).limit(500);
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const markStaffAttendance = async (req, res) => {
  try {
    const { date, staffId, staffName, status, checkIn, checkOut, department } = req.body;
    const filter = { schoolId: getSchoolId(req), date, staffId };
    const doc = await StaffAttendance.findOneAndUpdate(filter, { ...filter, staffName, status, checkIn, checkOut, department }, { upsert: true, new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const approveStaffAttendanceCorrection = async (req, res) => {
  try {
    const { status } = req.body;
    const doc = await StaffAttendance.findByIdAndUpdate(req.params.id, {
      'correctionRequest.status': status,
      ...(status === 'APPROVED' ? { status: req.body.newStatus } : {})
    }, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 9. EXAMS & MARKS
// ─────────────────────────────────────────────────────────
const getExams = async (req, res) => {
  try {
    const docs = await Exam.find({ schoolId: getSchoolId(req) }).sort({ startDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createExam = async (req, res) => {
  try {
    const doc = await Exam.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateExam = async (req, res) => {
  try {
    const doc = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Exam deleted' });
  } catch (e) { err(res, e.message); }
};
const publishExam = async (req, res) => {
  try {
    const doc = await Exam.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

const getMarks = async (req, res) => {
  try {
    const { examId, classId, studentId } = req.query;
    const query = {};
    if (examId) query.examId = examId;
    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;
    const docs = await Mark.find(query).sort({ percentage: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createMark = async (req, res) => {
  try {
    const data = req.body;
    if (data.subjectMarks) {
      const total = data.subjectMarks.reduce((s, m) => s + (m.marksObtained || 0), 0);
      const max = data.subjectMarks.reduce((s, m) => s + (m.maxMarks || 100), 0);
      data.totalMarksObtained = total;
      data.totalMaxMarks = max;
      data.percentage = max > 0 ? Math.round((total / max) * 100) : 0;
    }
    const doc = await Mark.create(data);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateMark = async (req, res) => {
  try {
    const doc = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteMark = async (req, res) => {
  try {
    await Mark.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Mark record deleted' });
  } catch (e) { err(res, e.message); }
};
const publishMarks = async (req, res) => {
  try {
    const { examId } = req.body;
    await Mark.updateMany({ examId }, { isPublished: true });
    ok(res, { message: 'Results published' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 10. HOMEWORK
// ─────────────────────────────────────────────────────────
const getHomework = async (req, res) => {
  try {
    const { classId, subject } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (classId) query.classId = classId;
    if (subject) query.subject = subject;
    const docs = await Homework.find(query).sort({ dueDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createHomework = async (req, res) => {
  try {
    const doc = await Homework.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateHomework = async (req, res) => {
  try {
    const doc = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteHomework = async (req, res) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 11. LMS CONTENT
// ─────────────────────────────────────────────────────────
const getLMSContent = async (req, res) => {
  try {
    const docs = await LMSContent.find({ schoolId: getSchoolId(req) }).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createLMSContent = async (req, res) => {
  try {
    const doc = await LMSContent.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateLMSContent = async (req, res) => {
  try {
    const doc = await LMSContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteLMSContent = async (req, res) => {
  try {
    await LMSContent.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 12. TIMETABLE
// ─────────────────────────────────────────────────────────
const getTimetable = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    const docs = await Timetable.find(query);
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const saveTimetable = async (req, res) => {
  try {
    const { classId, sectionId } = req.body;
    const doc = await Timetable.findOneAndUpdate({ classId, sectionId }, req.body, { upsert: true, new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 13. FEE CATEGORIES & STRUCTURES
// ─────────────────────────────────────────────────────────
const getFeeCategories = async (req, res) => {
  try {
    const docs = await FeeCategory.find({ schoolId: getSchoolId(req), isActive: true });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createFeeCategory = async (req, res) => {
  try {
    const doc = await FeeCategory.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateFeeCategory = async (req, res) => {
  try {
    const doc = await FeeCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteFeeCategory = async (req, res) => {
  try {
    await FeeCategory.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

const getFeeStructures = async (req, res) => {
  try {
    const docs = await FeeStructure.find({ schoolId: getSchoolId(req), isActive: true });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createFeeStructure = async (req, res) => {
  try {
    const doc = await FeeStructure.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateFeeStructure = async (req, res) => {
  try {
    const doc = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteFeeStructure = async (req, res) => {
  try {
    await FeeStructure.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 14. STUDENT FEES & PAYMENTS
// ─────────────────────────────────────────────────────────
const getStudentFees = async (req, res) => {
  try {
    const { studentId, classId, status } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (status) query.status = status;
    const docs = await StudentFee.find(query).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createStudentFee = async (req, res) => {
  try {
    const doc = await StudentFee.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateStudentFee = async (req, res) => {
  try {
    const doc = await StudentFee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteStudentFee = async (req, res) => {
  try {
    await StudentFee.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 15. LEAVE TYPES & REQUESTS
// ─────────────────────────────────────────────────────────
const getLeaveTypes = async (req, res) => {
  try {
    const docs = await LeaveType.find({ schoolId: getSchoolId(req), isActive: true });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createLeaveType = async (req, res) => {
  try {
    const doc = await LeaveType.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateLeaveType = async (req, res) => {
  try {
    const doc = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteLeaveType = async (req, res) => {
  try {
    await LeaveType.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

const getLeaveRequests = async (req, res) => {
  try {
    const { status, applicantRole } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (status) query.status = status;
    if (applicantRole) query.applicantRole = applicantRole;
    const docs = await LeaveRequest.find(query).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createLeaveRequest = async (req, res) => {
  try {
    const data = { ...req.body, schoolId: getSchoolId(req) };
    if (data.fromDate && data.toDate) {
      const diff = Math.ceil((new Date(data.toDate) - new Date(data.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
      data.totalDays = diff;
    }
    const doc = await LeaveRequest.create(data);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const approveLeaveRequest = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const doc = await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status,
      remarks,
      approvedBy: req.user?.name || 'Admin'
    }, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteLeaveRequest = async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 16. PAYROLL
// ─────────────────────────────────────────────────────────
const getPayroll = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;
    const docs = await Payroll.find(query).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await StaffHRMS.find({ schoolId: getSchoolId(req), isArchived: false });
    const payrolls = [];
    for (const emp of employees) {
      const existing = await Payroll.findOne({ schoolId: getSchoolId(req), employeeId: emp.employeeId, month, year });
      if (!existing) {
        const pf = Math.round(emp.basicSalary * 0.12);
        const net = emp.basicSalary + emp.allowances - emp.deductions - pf;
        const p = await Payroll.create({
          schoolId: getSchoolId(req),
          employeeId: emp.employeeId,
          employeeName: emp.name,
          month, year,
          basicSalary: emp.basicSalary,
          allowances: emp.allowances,
          deductions: emp.deductions,
          pf,
          netSalary: net,
          status: 'GENERATED'
        });
        payrolls.push(p);
      }
    }
    ok(res, { message: `Generated ${payrolls.length} payroll records`, payrolls });
  } catch (e) { err(res, e.message); }
};
const updatePayroll = async (req, res) => {
  try {
    const doc = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const approvePayroll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Payroll.updateMany({ _id: { $in: ids } }, { status: 'APPROVED', approvedBy: req.user?.name || 'Admin' });
    ok(res, { message: 'Payroll approved' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 17. LIBRARY
// ─────────────────────────────────────────────────────────
const getLibraryBooks = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } }
    ];
    const docs = await LibraryBook.find(query).sort({ title: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createLibraryBook = async (req, res) => {
  try {
    const data = { ...req.body, schoolId: getSchoolId(req) };
    data.availableCopies = data.totalCopies || 1;
    const doc = await LibraryBook.create(data);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateLibraryBook = async (req, res) => {
  try {
    const doc = await LibraryBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteLibraryBook = async (req, res) => {
  try {
    await LibraryBook.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

const getLibraryTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (status) query.status = status;
    const docs = await LibraryTransaction.find(query).sort({ issueDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const issueBook = async (req, res) => {
  try {
    const doc = await LibraryTransaction.create({ ...req.body, schoolId: getSchoolId(req) });
    await LibraryBook.findByIdAndUpdate(req.body.bookId, { $inc: { availableCopies: -1 } });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const returnBook = async (req, res) => {
  try {
    const tx = await LibraryTransaction.findById(req.params.id);
    const returnDate = new Date();
    const due = new Date(tx.dueDate);
    const overdueDays = Math.max(0, Math.ceil((returnDate - due) / (1000 * 60 * 60 * 24)));
    const fine = overdueDays * 5;
    const doc = await LibraryTransaction.findByIdAndUpdate(req.params.id, {
      status: 'RETURNED',
      returnDate,
      fineAmount: fine
    }, { new: true });
    await LibraryBook.findByIdAndUpdate(tx.bookId, { $inc: { availableCopies: 1 } });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 18. TRANSPORT
// ─────────────────────────────────────────────────────────
const getTransport = async (req, res) => {
  try {
    const docs = await Transport.find({ schoolId: getSchoolId(req) });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createTransport = async (req, res) => {
  try {
    const doc = await Transport.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateTransport = async (req, res) => {
  try {
    const doc = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteTransport = async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 19. HOSTEL
// ─────────────────────────────────────────────────────────
const getHostelRooms = async (req, res) => {
  try {
    const docs = await HostelRoom.find({ schoolId: getSchoolId(req), isActive: true }).sort({ roomNumber: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createHostelRoom = async (req, res) => {
  try {
    const doc = await HostelRoom.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateHostelRoom = async (req, res) => {
  try {
    const doc = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteHostelRoom = async (req, res) => {
  try {
    await HostelRoom.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

const getHostelAllocations = async (req, res) => {
  try {
    const docs = await HostelAllocation.find({ schoolId: getSchoolId(req), status: 'ACTIVE' }).sort({ allocatedDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createHostelAllocation = async (req, res) => {
  try {
    const doc = await HostelAllocation.create({ ...req.body, schoolId: getSchoolId(req) });
    await HostelRoom.findByIdAndUpdate(req.body.roomId, { $inc: { occupied: 1 } });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const vacateHostelAllocation = async (req, res) => {
  try {
    const a = await HostelAllocation.findByIdAndUpdate(req.params.id, { status: 'VACATED', vacatingDate: new Date() }, { new: true });
    await HostelRoom.findByIdAndUpdate(a.roomId, { $inc: { occupied: -1 } });
    ok(res, a);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 20. INVENTORY
// ─────────────────────────────────────────────────────────
const getInventory = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (category) query.category = category;
    const docs = await Inventory.find(query).sort({ itemName: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createInventoryItem = async (req, res) => {
  try {
    const doc = await Inventory.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateInventoryItem = async (req, res) => {
  try {
    const doc = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteInventoryItem = async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 21. HEALTH RECORDS
// ─────────────────────────────────────────────────────────
const getHealthRecords = async (req, res) => {
  try {
    const { classId, studentId } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;
    const docs = await HealthRecord.find(query).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createHealthRecord = async (req, res) => {
  try {
    const doc = await HealthRecord.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateHealthRecord = async (req, res) => {
  try {
    const doc = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteHealthRecord = async (req, res) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 22. DISCIPLINE
// ─────────────────────────────────────────────────────────
const getDisciplineRecords = async (req, res) => {
  try {
    const { classId, severity, status } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (classId) query.classId = classId;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    const docs = await Discipline.find(query).sort({ incidentDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createDisciplineRecord = async (req, res) => {
  try {
    const doc = await Discipline.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateDisciplineRecord = async (req, res) => {
  try {
    const doc = await Discipline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteDisciplineRecord = async (req, res) => {
  try {
    await Discipline.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 23. ANNOUNCEMENTS & COMMUNICATION
// ─────────────────────────────────────────────────────────
const getAnnouncements = async (req, res) => {
  try {
    const docs = await Announcement.find({ schoolId: getSchoolId(req), isArchived: false }).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createAnnouncement = async (req, res) => {
  try {
    const data = { ...req.body, schoolId: getSchoolId(req), createdBy: req.user?.name || 'Admin' };
    if (data.isPublished) data.publishedAt = new Date();
    const doc = await Announcement.create(data);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateAnnouncement = async (req, res) => {
  try {
    if (req.body.isPublished && !req.body.publishedAt) req.body.publishedAt = new Date();
    const doc = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 24. EVENTS
// ─────────────────────────────────────────────────────────
const getEvents = async (req, res) => {
  try {
    const docs = await Event.find({ schoolId: getSchoolId(req), isArchived: false }).sort({ startDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createEvent = async (req, res) => {
  try {
    const doc = await Event.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateEvent = async (req, res) => {
  try {
    const doc = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 25. VISITORS
// ─────────────────────────────────────────────────────────
const getVisitors = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      query.checkInTime = { $gte: start, $lte: end };
    }
    const docs = await Visitor.find(query).sort({ checkInTime: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createVisitor = async (req, res) => {
  try {
    const doc = await Visitor.create({ ...req.body, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const checkoutVisitor = async (req, res) => {
  try {
    const doc = await Visitor.findByIdAndUpdate(req.params.id, { checkOutTime: new Date(), status: 'CHECKED_OUT' }, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteVisitor = async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 26. HELPDESK
// ─────────────────────────────────────────────────────────
const getHelpdesk = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { schoolId: getSchoolId(req), isArchived: false };
    if (status) query.status = status;
    if (category) query.category = category;
    const docs = await Helpdesk.find(query).sort({ createdAt: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createHelpdeskTicket = async (req, res) => {
  try {
    const count = await Helpdesk.countDocuments({ schoolId: getSchoolId(req) });
    const ticketId = `TKT-${String(count + 1001).padStart(5, '0')}`;
    const doc = await Helpdesk.create({ ...req.body, ticketId, schoolId: getSchoolId(req) });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateHelpdeskTicket = async (req, res) => {
  try {
    const doc = await Helpdesk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteHelpdeskTicket = async (req, res) => {
  try {
    await Helpdesk.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 27. CERTIFICATES
// ─────────────────────────────────────────────────────────
const getCertificates = async (req, res) => {
  try {
    const docs = await Certificate.find({ schoolId: getSchoolId(req), isArchived: false }).sort({ issueDate: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createCertificate = async (req, res) => {
  try {
    const count = await Certificate.countDocuments({ schoolId: getSchoolId(req) });
    const certificateNo = `CERT-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`;
    const doc = await Certificate.create({ ...req.body, certificateNo, schoolId: getSchoolId(req), issuedBy: req.user?.name || 'Admin' });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateCertificate = async (req, res) => {
  try {
    const doc = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteCertificate = async (req, res) => {
  try {
    await Certificate.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Revoked and archived' });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 28. AUDIT LOGS
// ─────────────────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const { module, userId } = req.query;
    const query = { schoolId: getSchoolId(req) };
    if (module) query.module = module;
    if (userId) query.userId = userId;
    const docs = await SchoolAuditLog.find(query).sort({ createdAt: -1 }).limit(200);
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// 29. REPORTS & ANALYTICS
// ─────────────────────────────────────────────────────────
const getReportsDashboard = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const [
      totalStudents,
      totalStaff,
      totalExams,
      totalLibraryBooks,
      totalTransport,
      pendingLeaves,
      openTickets,
      pendingPayrolls,
    ] = await Promise.all([
      Student.countDocuments({ schoolId }),
      StaffHRMS.countDocuments({ schoolId, isArchived: false }),
      Exam.countDocuments({ schoolId }),
      LibraryBook.countDocuments({ schoolId, isArchived: false }),
      Transport.countDocuments({ schoolId }),
      LeaveRequest.countDocuments({ schoolId, status: 'PENDING' }),
      Helpdesk.countDocuments({ schoolId, status: 'OPEN' }),
      Payroll.countDocuments({ schoolId, status: 'GENERATED' }),
    ]);

    ok(res, {
      totalStudents, totalStaff, totalExams, totalLibraryBooks,
      totalTransport, pendingLeaves, openTickets, pendingPayrolls,
    });
  } catch (e) { err(res, e.message); }
};

// ─────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────
module.exports = {
  // Academic Year
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  // Classes & Subjects
  getClasses, createClass, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  // HR Setup
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  // People
  getStudentList, createStudentRecord, updateStudentRecord, deleteStudentRecord, promoteStudents,
  enrollStudentWithAccounts, previewNextRollNo,
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  // Attendance
  getStudentAttendance, markStudentAttendance,
  getStaffAttendance, markStaffAttendance, approveStaffAttendanceCorrection,
  // Academics
  getExams, createExam, updateExam, deleteExam, publishExam,
  getMarks, createMark, updateMark, deleteMark, publishMarks,
  getHomework, createHomework, updateHomework, deleteHomework,
  getLMSContent, createLMSContent, updateLMSContent, deleteLMSContent,
  getTimetable, saveTimetable,
  // Finance
  getFeeCategories, createFeeCategory, updateFeeCategory, deleteFeeCategory,
  getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure,
  getStudentFees, createStudentFee, updateStudentFee, deleteStudentFee,
  // HRMS
  getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
  getLeaveRequests, createLeaveRequest, approveLeaveRequest, deleteLeaveRequest,
  getPayroll, generatePayroll, updatePayroll, approvePayroll,
  // Campus
  getLibraryBooks, createLibraryBook, updateLibraryBook, deleteLibraryBook,
  getLibraryTransactions, issueBook, returnBook,
  getTransport, createTransport, updateTransport, deleteTransport,
  getHostelRooms, createHostelRoom, updateHostelRoom, deleteHostelRoom,
  getHostelAllocations, createHostelAllocation, vacateHostelAllocation,
  getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  getHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord,
  getDisciplineRecords, createDisciplineRecord, updateDisciplineRecord, deleteDisciplineRecord,
  // Communication
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getEvents, createEvent, updateEvent, deleteEvent,
  getVisitors, createVisitor, checkoutVisitor, deleteVisitor,
  // Admin
  getHelpdesk, createHelpdeskTicket, updateHelpdeskTicket, deleteHelpdeskTicket,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getAuditLogs,
  getReportsDashboard,
};

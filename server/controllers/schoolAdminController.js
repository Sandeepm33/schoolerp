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

const isSchoolAdminReq = (req) => {
  const role = String(req.user?.role || req.user?.designation || '').toUpperCase();
  return role.includes('SCHOOL_ADMIN') || role.includes('PRINCIPAL') || role.includes('HEADMASTER') || role.includes('HEAD_MASTER');
};

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
// Helper to normalize class names (e.g. "Class 1" -> "1", "Class 10" -> "10")
const normalizeClassName = (name) => {
  if (!name) return '';
  return String(name).replace(/^Class\s+/i, '').trim();
};

const getClasses = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const docs = await ClassRoom.find({ 
      $or: [{ schoolId }, { schoolId: null }],
      isActive: true 
    }).sort({ className: 1 });
    
    // Auto-deduplicate duplicate class documents if any exist
    const map = new Map();
    const duplicatesToRemove = [];

    for (const doc of docs) {
      const normName = normalizeClassName(doc.className);
      if (!map.has(normName)) {
        if (doc.className !== normName) {
          doc.className = normName;
          await ClassRoom.findByIdAndUpdate(doc._id, { className: normName });
        }
        map.set(normName, doc);
      } else {
        const existing = map.get(normName);
        const mergedSections = Array.from(new Set([
          ...(Array.isArray(existing.sections) ? existing.sections : []),
          ...(Array.isArray(doc.sections) ? doc.sections : [])
        ]));
        existing.sections = mergedSections;
        await ClassRoom.findByIdAndUpdate(existing._id, { sections: mergedSections, className: normName });
        duplicatesToRemove.push(doc._id);
      }
    }

    if (duplicatesToRemove.length > 0) {
      await ClassRoom.updateMany(
        { _id: { $in: duplicatesToRemove } },
        { isActive: false }
      );
    }

    const cleanDocs = Array.from(map.values());
    ok(res, cleanDocs);
  } catch (e) { err(res, e.message); }
};

const createClass = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can create or edit classes.', 403);
    const schoolId = getSchoolId(req);
    const rawName = req.body.className;
    const cleanClass = normalizeClassName(rawName);

    if (!cleanClass) {
      return err(res, 'Class name is required', 400);
    }

    const incomingSections = Array.isArray(req.body.sections) 
      ? req.body.sections 
      : (req.body.sections ? String(req.body.sections).split(',').map(s => s.trim()).filter(Boolean) : ['A']);

    const existing = await ClassRoom.findOne({
      $or: [{ schoolId }, { schoolId: null }],
      className: { $regex: new RegExp(`^(Class\\s+)?${cleanClass}$`, 'i') },
      isActive: true
    });

    if (existing) {
      const mergedSections = Array.from(new Set([
        ...(Array.isArray(existing.sections) ? existing.sections : []),
        ...incomingSections
      ]));
      existing.sections = mergedSections;
      if (req.body.classTeacher) existing.classTeacher = req.body.classTeacher;
      if (req.body.capacity) existing.capacity = Number(req.body.capacity);
      if (req.body.academicYear) existing.academicYear = req.body.academicYear;
      existing.className = cleanClass;
      await existing.save();
      return ok(res, existing, 200);
    }

    const doc = await ClassRoom.create({
      ...req.body,
      schoolId,
      className: cleanClass,
      sections: incomingSections,
      isActive: true
    });
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};

const updateClass = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can create or edit classes.', 403);
    const data = { ...req.body };
    if (data.className) data.className = normalizeClassName(data.className);
    const doc = await ClassRoom.findByIdAndUpdate(req.params.id, data, { new: true });
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

const deleteClass = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can delete classes.', 403);
    await ClassRoom.findByIdAndUpdate(req.params.id, { isActive: false });
    ok(res, { message: 'Archived successfully' });
  } catch (e) { err(res, e.message); }
};

const createClassesBulk = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can create classes.', 403);
    const schoolId = getSchoolId(req);
    const { classes } = req.body;

    if (!Array.isArray(classes) || classes.length === 0) {
      return err(res, 'Array of classes is required', 400);
    }

    const resultDocs = [];
    for (const item of classes) {
      if (!item.className) continue;
      const cleanClass = normalizeClassName(item.className);
      const incomingSections = Array.isArray(item.sections) && item.sections.length > 0 
        ? item.sections 
        : ['A'];

      const existing = await ClassRoom.findOne({
        $or: [{ schoolId }, { schoolId: null }],
        className: { $regex: new RegExp(`^(Class\\s+)?${cleanClass}$`, 'i') },
        isActive: true
      });

      if (existing) {
        const mergedSections = Array.from(new Set([
          ...(Array.isArray(existing.sections) ? existing.sections : []),
          ...incomingSections
        ]));
        existing.sections = mergedSections;
        if (item.capacity) existing.capacity = Number(item.capacity);
        if (item.academicYear) existing.academicYear = item.academicYear;
        existing.className = cleanClass;
        await existing.save();
        resultDocs.push(existing);
      } else {
        const doc = await ClassRoom.create({
          schoolId,
          className: cleanClass,
          sections: incomingSections,
          capacity: Number(item.capacity) || 40,
          roomNo: item.roomNo || '',
          classTeacher: item.classTeacher || 'Unassigned',
          academicYear: item.academicYear || '2026-2027',
          isActive: true
        });
        resultDocs.push(doc);
      }
    }

    await logAudit(req, 'BULK_CREATE', 'ClassRoom', null, null, { count: resultDocs.length });
    ok(res, { message: `Processed ${resultDocs.length} classes without duplicates`, classes: resultDocs }, 201);
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
    const query = {};
    const schoolId = getSchoolId(req);
    if (schoolId) query.schoolId = schoolId;

    if (classId && classId !== 'ALL') {
      const normClass = normalizeClassName(classId);
      query.classId = { $regex: new RegExp(`^(${normClass}|Class\\s*${normClass})$`, 'i') };
    }
    if (sectionId && sectionId !== 'ALL') {
      const normSec = String(sectionId).replace(/^Section\s+/i, '').trim();
      query.sectionId = { $regex: new RegExp(`^(${normSec}|Section\\s*${normSec})$`, 'i') };
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }
    const docs = await Student.find(query).sort({ firstName: 1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};

const createStudentRecord = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can create student records.', 403);
    const doc = await Student.create({ ...req.body, schoolId: getSchoolId(req) });
    await logAudit(req, 'CREATE', 'Student', doc._id, null, doc);
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};

const updateStudentRecord = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can edit student records.', 403);
    const old = await Student.findById(req.params.id);
    const doc = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, strict: false });
    
    // Sync with Transport routes if transportRoute field is present in payload
    if (req.body.transportRoute !== undefined) {
      // Remove student from any previous transport routes first
      await Transport.updateMany(
        { 'assignedStudents.studentId': doc._id },
        { $pull: { assignedStudents: { studentId: doc._id } } }
      );
      if (req.body.transportRoute) {
        const transport = await Transport.findOne({ routeName: req.body.transportRoute });
        if (transport) {
          transport.assignedStudents.push({
            studentId: doc._id,
            studentName: `${doc.firstName} ${doc.lastName}`,
            rollNo: doc.rollNo,
            classId: doc.classId,
            sectionId: doc.sectionId,
            pickupStop: req.body.pickupStop || doc.pickupStop || '',
            monthlyFee: req.body.transportFee || 0,
            parentPhone: doc.parentPhone || ''
          });
          await transport.save();
        }
      }
    }

    await logAudit(req, 'UPDATE', 'Student', doc._id, old, doc);
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

const deleteStudentRecord = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can delete student records.', 403);
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
const generateRollNo = async (classId, sectionId, schoolId) => {
  const cleanClass = (classId || '').replace(/^Class\s+/i, '').trim();
  const classNum = cleanClass.replace(/\D/g, '') || cleanClass; // e.g. "10", "LKG", "UKG", "Nursery"
  const noSection = !sectionId || sectionId.trim() === '' || sectionId.trim() === '-';
  const sectionLabel = noSection ? '' : (sectionId || '').trim().toUpperCase().charAt(0);
  const prefix = noSection ? `${classNum}` : `${classNum}${sectionLabel}`;

  // Find all existing students across DB whose rollNo starts with prefix (e.g. LKGA)
  const existingStudents = await Student.find({
    rollNo: new RegExp('^' + prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
  }).select('rollNo');

  let maxSeq = 0;
  for (const st of existingStudents) {
    if (st.rollNo) {
      const match = st.rollNo.match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateRollNo = '';

  // Double check uniqueness in DB globally
  while (true) {
    const seqStr = String(nextSeq).padStart(2, '0');
    candidateRollNo = `${prefix}${seqStr}`;

    const exists = await Student.findOne({ 
      rollNo: new RegExp('^' + candidateRollNo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') 
    });

    if (!exists) {
      break;
    }
    nextSeq++;
  }

  return candidateRollNo;
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
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can enroll students.', 403);
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

    if (!firstName || !classId) {
      return err(res, 'First name and Class ID are required', 400);
    }
    if (!studentPassword || !studentPassword.trim()) {
      return err(res, 'Student password is required', 400);
    }
    if (!parentEmail || !parentPassword || !parentPassword.trim()) {
      return err(res, 'Parent email and parent password are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (providedStudentEmail && !emailRegex.test(providedStudentEmail.trim())) {
      return err(res, `Invalid student email format '${providedStudentEmail}'. Must be a valid email address (e.g. student@school.com).`, 400);
    }
    if (parentEmail && !emailRegex.test(parentEmail.trim())) {
      return err(res, `Invalid parent email format '${parentEmail}'. Must be a valid email address (e.g. parent@school.com).`, 400);
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
      lastName: lastName || '',
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
    const hashedStudentPass = await bcrypt.hash(studentPassword || '', 10);
    const studentUser = await User.create({
      schoolId,
      username: studentEmail,
      email: studentEmail,
      password: hashedStudentPass,
      role: 'STUDENT',
      name: `${firstName} ${lastName || ''}`.trim(),
      mappedStudentId: studentDoc._id,
    });

    // --- Check if parent User already exists ---
    let parentUser = existingParentUser;
    if (!parentUser) {
      const hashedParentPass = await bcrypt.hash(parentPassword || '', 10);
      parentUser = await User.create({
        schoolId,
        username: parentEmail.toLowerCase().trim(),
        email: parentEmail.toLowerCase().trim(),
        password: hashedParentPass,
        role: 'PARENT',
        name: parentName || `Parent of ${firstName}`,
        phone: parentPhone || '',
        mappedStudentId: studentDoc._id,
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
          password: studentPassword || '',
          rollNo,
          admissionNo,
        },
        parent: {
          name: parentName || `Parent of ${firstName}`,
          email: parentEmail.toLowerCase().trim(),
          password: parentPassword || '',
        },
      },
    }, 201);
  } catch (e) { err(res, e.message); }
};

const enrollStudentsBulk = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { students, defaultClassId, defaultSectionId } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return err(res, 'Array of students is required', 400);
    }

    const enrolledResults = [];
    const errors = [];

    for (let index = 0; index < students.length; index++) {
      const s = students[index];
      const firstName = (s.firstName || '').trim();
      const lastName = (s.lastName || '').trim();
      const classId = (s.classId || defaultClassId || '').trim();
      const sectionId = (s.sectionId || defaultSectionId || 'A').trim();
      const gender = (s.gender || 'Male').trim();
      const dob = s.dob || null;
      const parentName = (s.parentName || `Parent of ${firstName}`).trim();
      const parentPhone = (s.parentPhone || '').trim();
      const parentEmail = (s.parentEmail || `${firstName.toLowerCase()}.${Date.now()}@parent.com`).toLowerCase().trim();

      if (!firstName || !classId) {
        errors.push({ index: index + 1, name: `${firstName} ${lastName}`, error: 'First name and Class ID are required' });
        continue;
      }
      if (!s.studentPassword || !s.studentPassword.trim()) {
        errors.push({ index: index + 1, name: `${firstName} ${lastName}`, error: 'Student password is required' });
        continue;
      }
      if (!s.parentPassword || !s.parentPassword.trim()) {
        errors.push({ index: index + 1, name: `${firstName} ${lastName}`, error: 'Parent password is required' });
        continue;
      }

      try {
        const rollNo = s.rollNo || (await generateRollNo(classId, sectionId, schoolId));
        const count = await Student.countDocuments();
        const admissionNo = s.admissionNo || `ADM-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
        
        const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const autoStudentEmail = `${cleanFirst}.${rollNo.toLowerCase()}@school.erp`;
        const studentEmail = (s.studentEmail || autoStudentEmail).toLowerCase().trim();

        const studentPassword = s.studentPassword || '';
        const parentPassword = s.parentPassword || '';

        const studentDoc = await Student.create({
          schoolId,
          firstName,
          lastName,
          admissionNo,
          rollNo,
          classId,
          sectionId,
          dob,
          gender,
          bloodGroup: s.bloodGroup || 'O+',
          address: s.address || '',
          parentName,
          parentPhone,
          parentEmail,
          studentEmail,
          attendancePercentage: 0,
          totalPresent: 0,
          totalClasses: 0
        });

        const hashedStudentPass = await bcrypt.hash(studentPassword, 10);
        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
          studentUser = await User.create({
            schoolId,
            name: `${firstName} ${lastName}`,
            email: studentEmail,
            password: hashedStudentPass,
            role: 'STUDENT',
            phone: '',
            status: 'ACTIVE'
          });
        }

        let parentUser = await User.findOne({ email: parentEmail });
        if (!parentUser) {
          const hashedParentPass = await bcrypt.hash(parentPassword, 10);
          parentUser = await User.create({
            schoolId,
            name: parentName,
            email: parentEmail,
            password: hashedParentPass,
            role: 'PARENT',
            phone: parentPhone,
            mappedStudentId: studentDoc._id,
            status: 'ACTIVE'
          });
        }

        await Student.findByIdAndUpdate(studentDoc._id, {
          parentId: parentUser._id,
          studentUserId: studentUser._id
        });

        enrolledResults.push({
          studentId: studentDoc._id,
          name: `${firstName} ${lastName}`,
          classId,
          sectionId,
          rollNo,
          admissionNo,
          studentEmail,
          parentEmail
        });
      } catch (errItem) {
        errors.push({ index: index + 1, name: `${firstName} ${lastName}`, error: errItem.message });
      }
    }

    await logAudit(req, 'BULK_ENROLL', 'Student', null, null, { successCount: enrolledResults.length, errorCount: errors.length });

    ok(res, {
      message: `Bulk enrollment completed. ${enrolledResults.length} students enrolled successfully!`,
      successCount: enrolledResults.length,
      errorCount: errors.length,
      students: enrolledResults,
      errors
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
    delete data.role;

    if (!data.employeeId) {
      const count = await StaffHRMS.countDocuments({ schoolId: getSchoolId(req) });
      data.employeeId = `EMP${String(count + 1001).padStart(5, '0')}`;
    }
    if (!data.netSalary) {
      data.netSalary = (data.basicSalary || 0) + (data.allowances || 0) - (data.deductions || 0);
    }

    const requesterDesig = (req.user?.designation || '').toUpperCase();
    const requesterRole = (req.user?.role || '').toUpperCase();
    const isLeadershipRequester = requesterDesig.includes('HEAD') || 
                                 requesterDesig.includes('PRINCIPAL') || 
                                 requesterDesig.includes('VICE') ||
                                 requesterRole === 'HEADMASTER' ||
                                 requesterRole === 'PRINCIPAL' ||
                                 requesterRole === 'VICE_PRINCIPAL';

    const rawType = (data.employeeType || 'TEACHER').toUpperCase();
    if (isLeadershipRequester && ['HEADMASTER', 'HEAD_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(rawType)) {
      return err(res, '❌ Permission Denied: Headmaster, Vice Principal, and Principal accounts cannot create Headmaster, Vice Principal, or Principal roles. Only primary School Admin can add leadership accounts.', 403);
    }

    if (['HEADMASTER', 'HEAD_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(rawType)) {
      if (!data.designation || data.designation === 'Teacher') {
        data.designation = rawType === 'HEADMASTER' ? 'Headmaster' : rawType === 'PRINCIPAL' ? 'Principal' : 'Vice Principal';
      }
      data.employeeType = 'ADMIN';
    }


    
    // Auto-create User Login Account for Teacher / Staff
    if (data.email) {
      const cleanEmail = data.email.toLowerCase().trim();
      let existingUser = await User.findOne({ email: cleanEmail });
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(data.password || 'teacher123', 10);
        const typeToCheck = (data.employeeType || rawType || '').toUpperCase();

        let userRole = 'TEACHER';
        if (['HEADMASTER', 'HEAD_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SCHOOL_ADMIN', 'HR'].includes(typeToCheck)) {
          userRole = 'SCHOOL_ADMIN';
        } else if (typeToCheck === 'ACCOUNTANT') {
          userRole = 'ACCOUNTANT';
        } else {
          userRole = 'TEACHER';
        }

        existingUser = await User.create({
          schoolId: getSchoolId(req),
          name: data.name,
          email: cleanEmail,
          password: passwordHash,
          role: userRole,
          phone: data.phone || '',
          designation: data.designation || rawType || 'Teacher',
          status: 'ACTIVE'
        });
      }
      if (existingUser) {
        data.userId = existingUser._id;
      }
    }


    const doc = await StaffHRMS.create(data);


    // If assigned as Class Teacher, update ClassRoom record
    if (data.assignedClass && data.assignedClass !== 'None') {
      const clsName = data.assignedClass.replace(/^Class\s+/i, '').split('-')[0].trim();
      await ClassRoom.findOneAndUpdate(
        { schoolId: getSchoolId(req), className: clsName },
        { classTeacher: data.name },
        { upsert: false }
      );
    }

    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};

const updateEmployee = async (req, res) => {
  try {
    const data = { ...req.body };
    const rawType = data.employeeType;
    if (['HEADMASTER', 'HEAD_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(rawType)) {
      if (!data.designation || data.designation === 'Teacher') {
        data.designation = rawType === 'HEADMASTER' ? 'Headmaster' : rawType === 'PRINCIPAL' ? 'Principal' : 'Vice Principal';
      }
      data.employeeType = 'ADMIN';
    }
    const doc = await StaffHRMS.findByIdAndUpdate(req.params.id, data, { new: true });

    
    // Update User account if designation or name changed
    if (doc && doc.userId) {
      await User.findByIdAndUpdate(doc.userId, {
        name: doc.name,
        phone: doc.phone,
        designation: doc.designation
      });
    }

    if (req.body.assignedClass && req.body.assignedClass !== 'None') {
      const clsName = req.body.assignedClass.replace(/^Class\s+/i, '').split('-')[0].trim();
      await ClassRoom.findOneAndUpdate(
        { schoolId: getSchoolId(req), className: clsName },
        { classTeacher: doc.name },
        { upsert: false }
      );
    }

    ok(res, doc);
  } catch (e) { err(res, e.message); }
};

const deleteEmployee = async (req, res) => {
  try {
    const emp = await StaffHRMS.findById(req.params.id);
    if (emp && emp.userId) {
      await User.findByIdAndUpdate(emp.userId, { status: 'INACTIVE' });
    }
    await StaffHRMS.findByIdAndUpdate(req.params.id, { isArchived: true });
    ok(res, { message: 'Employee archived and login deactivated' });
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
    const role = String(req.user?.role || req.user?.designation || '').toUpperCase();
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const query = {};

    if (examId) query.examId = examId;
    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;

    // Security & Privacy filter: Parents & Students MUST ONLY see their own / child's published marks
    if (role === 'STUDENT' || role === 'PARENT') {
      query.$or = [{ isPublished: true }, { approvalStatus: 'PUBLISHED' }];
      let targetStudentId = studentId || req.user?.mappedStudentId || req.user?.studentId || req.user?.linkedStudentId;
      let targetStudentNames = [];

      if (role === 'PARENT') {
        let parentUser = null;
        if (userId) {
          parentUser = await User.findById(userId).catch(() => null);
        }
        let studentRecord = null;
        if (targetStudentId) {
          studentRecord = await Student.findById(targetStudentId).catch(() => null);
        }
        if (!studentRecord && parentUser?.mappedStudentId) {
          studentRecord = await Student.findById(parentUser.mappedStudentId).catch(() => null);
        }
        if (!studentRecord && (userId || userEmail)) {
          studentRecord = await Student.findOne({
            $or: [
              { parentId: userId },
              { parentId: String(userId) },
              { parentEmail: userEmail }
            ]
          }).catch(() => null);
        }
        if (studentRecord) {
          targetStudentId = studentRecord._id;
          const fullName = `${studentRecord.firstName || ''} ${studentRecord.lastName || ''}`.trim();
          if (fullName) targetStudentNames.push(fullName);
        }
      } else if (role === 'STUDENT') {
        let studentDoc = targetStudentId ? await Student.findById(targetStudentId).catch(() => null) : null;
        if (!studentDoc && userId) {
          studentDoc = await Student.findOne({
            $or: [
              { studentUserId: userId },
              { studentUserId: String(userId) },
              { email: userEmail },
              { studentEmail: userEmail }
            ]
          }).catch(() => null);
        }
        if (studentDoc) {
          targetStudentId = studentDoc._id;
          const fullName = `${studentDoc.firstName || ''} ${studentDoc.lastName || ''}`.trim();
          if (fullName) targetStudentNames.push(fullName);
        } else if (req.user?.name) {
          targetStudentNames.push(req.user.name);
        }
      }

      const filters = [];
      if (targetStudentId) {
        filters.push({ studentId: targetStudentId });
        filters.push({ studentId: String(targetStudentId) });
      }
      targetStudentNames.forEach(name => {
        if (name) {
          filters.push({ studentName: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
        }
      });

      if (filters.length > 0) {
        query.$and = [
          { $or: [{ isPublished: true }, { approvalStatus: 'PUBLISHED' }] },
          { $or: filters }
        ];
        delete query.$or;
      }
    }

    const docs = await Mark.find(query).sort({ percentage: -1 });
    const formatted = docs.map(d => {
      const obj = d.toObject ? d.toObject() : { ...d };
      if (!obj.subjectName && Array.isArray(obj.subjectMarks) && obj.subjectMarks[0]?.subject) {
        obj.subjectName = obj.subjectMarks[0].subject;
      }
      return obj;
    });
    ok(res, formatted);
  } catch (e) { err(res, e.message); }
};
const createMark = async (req, res) => {
  try {
    const data = req.body;
    const userRole = String(req.user?.role || req.user?.designation || '').toUpperCase();
    const userName = req.user?.name || 'User';

    const isTeacher = userRole.includes('TEACHER');
    const isPrincipal = userRole.includes('PRINCIPAL') || userRole.includes('VICE_PRINCIPAL');
    const isHeadmaster = userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');

    // ONLY Headmaster can set isPublished: true. Principal and Teacher mark entries MUST default to false.
    let initialStatus = 'SUBMITTED_BY_TEACHER';
    let initialPublished = false;

    if (isPrincipal && !isHeadmaster) {
      initialStatus = 'APPROVED_BY_PRINCIPAL';
      initialPublished = false;
    } else if (isHeadmaster) {
      initialStatus = 'PUBLISHED';
      initialPublished = true;
    }

    if (Array.isArray(data)) {
      const preparedData = data.map(item => {
        const itemStatus = item.approvalStatus || initialStatus;
        // Strictly prohibit setting isPublished to true unless approvalStatus is PUBLISHED (Headmaster action)
        const finalPublished = itemStatus === 'PUBLISHED' ? true : false;
        return {
          ...item,
          subjectName: item.subjectName || (Array.isArray(item.subjectMarks) && item.subjectMarks[0]?.subject) || 'General',
          approvalStatus: itemStatus,
          isPublished: finalPublished,
          submittedBy: { name: userName, role: userRole, date: new Date() }
        };
      });

      // Upsert marks per student, class, exam & subject
      const docs = await Promise.all(preparedData.map(async item => {
        const filter = {
          studentId: item.studentId,
          classId: item.classId,
          examTitle: item.examTitle,
          subjectName: item.subjectName
        };
        const updated = await Mark.findOneAndUpdate(
          filter,
          { $set: item },
          { new: true, upsert: true }
        );
        return updated;
      }));

      return ok(res, docs, 201);
    }

    if (data && data.subjectMarks) {
      const total = data.subjectMarks.reduce((s, m) => s + (m.marksObtained || 0), 0);
      const max = data.subjectMarks.reduce((s, m) => s + (m.maxMarks || 100), 0);
      data.totalMarksObtained = total;
      data.totalMaxMarks = max;
      data.percentage = max > 0 ? Math.round((total / max) * 100) : 0;
    }
    const itemStatus = data.approvalStatus || initialStatus;
    data.approvalStatus = itemStatus;
    data.isPublished = itemStatus === 'PUBLISHED' ? true : false;
    data.submittedBy = { name: userName, role: userRole, date: new Date() };

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
    const userRole = String(req.user?.role || req.user?.designation || '').toUpperCase();
    const isHeadmaster = userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');
    const isSchoolAdmin = userRole.includes('SUPER_ADMIN');

    if (!isHeadmaster && !isSchoolAdmin) {
      return err(res, 'Only Headmaster can publish mark results to parents and students');
    }

    const { examId, ids } = req.body;
    if (ids && Array.isArray(ids)) {
      await Mark.updateMany({ _id: { $in: ids } }, { isPublished: true, approvalStatus: 'PUBLISHED' });
    } else if (examId) {
      await Mark.updateMany({ examId }, { isPublished: true, approvalStatus: 'PUBLISHED' });
    } else {
      await Mark.updateMany({}, { isPublished: true, approvalStatus: 'PUBLISHED' });
    }
    ok(res, { message: 'Results published to parents and students successfully' });
  } catch (e) { err(res, e.message); }
};

const approveMarkWorkflow = async (req, res) => {
  try {
    const { id, ids, action, comments } = req.body; // action: 'APPROVE' | 'REJECT'
    const userRole = String(req.user?.role || req.user?.designation || '').toUpperCase();
    const userName = req.user?.name || 'Admin';

    const targetIds = Array.isArray(ids) ? ids : (id ? [id] : []);
    if (targetIds.length === 0) return err(res, 'No mark records specified');

    for (const mId of targetIds) {
      const mark = await Mark.findById(mId);
      if (!mark) continue;

      if (action === 'REJECT') {
        mark.approvalStatus = 'REJECTED';
        mark.isPublished = false;
      } else if (mark.approvalStatus === 'APPROVED_BY_PRINCIPAL') {
        // Stage 2: Headmaster Release (From APPROVED_BY_PRINCIPAL -> PUBLISHED)
        mark.approvalStatus = 'PUBLISHED';
        mark.isPublished = true;
        mark.headmasterApproval = { approvedBy: userName, approvedAt: new Date(), comments: comments || 'Approved & Released by Headmaster' };
        if (!mark.principalApproval || !mark.principalApproval.approvedBy) {
          mark.principalApproval = { approvedBy: 'Approved (Principal Forward)', approvedAt: new Date() };
        }
      } else {
        // Stage 1: Principal Approval (From SUBMITTED_BY_TEACHER -> APPROVED_BY_PRINCIPAL)
        // MUST NEVER PUBLISH DIRECTLY TO PARENTS/STUDENTS.
        mark.approvalStatus = 'APPROVED_BY_PRINCIPAL';
        mark.isPublished = false;
        mark.principalApproval = { approvedBy: userName, approvedAt: new Date(), comments: comments || 'Approved & Forwarded by Principal' };
      }
      await mark.save();
    }
    ok(res, { message: `Successfully ${action === 'REJECT' ? 'rejected' : 'approved'} ${targetIds.length} mark record(s)` });
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
const verifyHomeworkSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, status, teacherComment, grade } = req.body;
    const targetStatus = status || 'VERIFIED';

    const hw = await Homework.findById(id);
    if (!hw) return err(res, 'Homework not found', 404);

    if (!hw.submissions) hw.submissions = [];
    const subIdx = hw.submissions.findIndex(s => String(s.studentId) === String(studentId) || s.studentName === studentName);
    if (subIdx >= 0) {
      hw.submissions[subIdx].status = targetStatus;
      if (teacherComment) hw.submissions[subIdx].teacherComment = teacherComment;
      if (grade) hw.submissions[subIdx].grade = grade;
    } else {
      hw.submissions.push({
        studentId,
        studentName: studentName || 'Student',
        submittedAt: new Date(),
        status: targetStatus,
        teacherComment: teacherComment || 'Verified & marked completed by faculty',
        grade: grade || 'A+'
      });
    }

    await hw.save();
    ok(res, hw);
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
    if (classId) {
      const cleanCls = String(classId).replace(/^Class\s+/i, '').trim();
      query.classId = { $regex: new RegExp(`^(${cleanCls}|Class\\s*${cleanCls})$`, 'i') };
    }
    if (sectionId) {
      const cleanSec = String(sectionId).replace(/^Section\s+/i, '').trim();
      query.sectionId = { $regex: new RegExp(`^(${cleanSec}|Section\\s*${cleanSec})$`, 'i') };
    }
    const docs = await Timetable.find(query).sort({ updatedAt: -1, _id: -1 });
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const saveTimetable = async (req, res) => {
  try {
    if (!isSchoolAdminReq(req)) return err(res, 'Access denied. Only School Administrators can save or modify timetables.', 403);
    const { classId, sectionId } = req.body;
    const cleanCls = String(classId || 'LKG').replace(/^Class\s+/i, '').trim();
    const cleanSec = String(sectionId || 'A').replace(/^Section\s+/i, '').trim();
    const schoolId = getSchoolId(req);
    
    // Delete any old duplicate entries for this class and section to prevent stale records
    await Timetable.deleteMany({
      classId: { $regex: new RegExp(`^${cleanCls}$`, 'i') },
      sectionId: { $regex: new RegExp(`^${cleanSec}$`, 'i') }
    });

    const doc = await Timetable.create({
      ...req.body,
      classId: cleanCls,
      sectionId: cleanSec,
      schoolId
    });
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
    const schoolId = getSchoolId(req);
    const query = schoolId 
      ? { $or: [{ schoolId }, { schoolId: null }, { schoolId: { $exists: false } }] }
      : {};
    const docs = await Transport.find(query);
    ok(res, docs);
  } catch (e) { err(res, e.message); }
};
const createTransport = async (req, res) => {
  try {
    const { routeName, vehicleNo, vehicleType, driverName, driverPhone, helperName, helperPhone, capacity, monthlyFee, stops, isActive } = req.body;
    const baseFee = Number(monthlyFee) || 1500;
    const formattedStops = Array.isArray(stops) ? stops.map(s => {
      if (typeof s === 'string') return { stopName: s, monthlyFee: baseFee, pickupTime: '07:30 AM', dropTime: '04:30 PM' };
      const stopFare = (s && s.monthlyFee !== undefined && s.monthlyFee !== null && s.monthlyFee !== '' && !isNaN(s.monthlyFee)) 
        ? Number(s.monthlyFee) 
        : baseFee;
      return {
        stopName: String(s.stopName || '').trim(),
        monthlyFee: stopFare,
        pickupTime: s.pickupTime || '07:30 AM',
        dropTime: s.dropTime || '04:30 PM'
      };
    }) : [];
    const doc = await Transport.create({
      schoolId: getSchoolId(req),
      routeName, vehicleNo, vehicleType, driverName, driverPhone,
      helperName: helperName || '',
      helperPhone: helperPhone || '',
      capacity: Number(capacity) || 40,
      monthlyFee: baseFee,
      stops: formattedStops,
      isActive: isActive !== false
    });
    console.log("CREATED TRANSPORT DOC:", JSON.stringify(doc));
    ok(res, doc, 201);
  } catch (e) { err(res, e.message); }
};
const updateTransport = async (req, res) => {
  try {
    const { routeName, vehicleNo, vehicleType, driverName, driverPhone, helperName, helperPhone, capacity, monthlyFee, stops, isActive } = req.body;
    const baseFee = Number(monthlyFee) || 1500;
    const formattedStops = Array.isArray(stops) ? stops.map(s => {
      if (typeof s === 'string') return { stopName: s, monthlyFee: baseFee, pickupTime: '07:30 AM', dropTime: '04:30 PM' };
      const stopFare = (s && s.monthlyFee !== undefined && s.monthlyFee !== null && s.monthlyFee !== '' && !isNaN(s.monthlyFee)) 
        ? Number(s.monthlyFee) 
        : baseFee;
      return {
        stopName: String(s.stopName || '').trim(),
        monthlyFee: stopFare,
        pickupTime: s.pickupTime || '07:30 AM',
        dropTime: s.dropTime || '04:30 PM'
      };
    }) : [];
    const doc = await Transport.findByIdAndUpdate(
      req.params.id, 
      {
        $set: {
          routeName, vehicleNo, vehicleType, driverName, driverPhone,
          helperName: helperName || '',
          helperPhone: helperPhone || '',
          capacity: Number(capacity) || 40,
          monthlyFee: baseFee,
          stops: formattedStops,
          isActive: isActive !== false
        }
      },
      { new: true, strict: false }
    );
    console.log("UPDATED TRANSPORT DOC:", JSON.stringify(doc));
    ok(res, doc);
  } catch (e) { err(res, e.message); }
};
const deleteTransport = async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    ok(res, { message: 'Deleted' });
  } catch (e) { err(res, e.message); }
};

const assignStudentToTransport = async (req, res) => {
  try {
    const { studentId, pickupStop, monthlyFee } = req.body;
    const transport = await Transport.findById(req.params.id);
    if (!transport) return err(res, 'Transport route not found');

    const student = await Student.findById(studentId);
    if (!student) return err(res, 'Student not found');

    const matchedStop = (transport.stops || []).find(st => 
      typeof st === 'string' 
        ? st.toLowerCase() === String(pickupStop || '').toLowerCase()
        : (st.stopName || '').toLowerCase() === String(pickupStop || '').toLowerCase()
    );
    const calculatedFee = Number(monthlyFee) > 0 
      ? Number(monthlyFee) 
      : (matchedStop && typeof matchedStop === 'object' && matchedStop.monthlyFee > 0 
          ? Number(matchedStop.monthlyFee) 
          : (Number(transport.monthlyFee) || 1500));

    const alreadyAssigned = (transport.assignedStudents || []).some(s => String(s.studentId) === String(studentId));
    if (!alreadyAssigned) {
      if ((transport.assignedStudents || []).length >= (transport.capacity || 40)) {
        return err(res, `Cannot assign student: Bus route has reached full capacity (${transport.capacity} seats).`);
      }

      if (!transport.assignedStudents) transport.assignedStudents = [];
      transport.assignedStudents.push({
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
        rollNo: student.rollNo || '',
        classId: student.classId,
        sectionId: student.sectionId,
        pickupStop: pickupStop || 'Main Stop',
        monthlyFee: calculatedFee,
        parentPhone: student.parentPhone || ''
      });
      await transport.save();
    }

    await Student.findByIdAndUpdate(studentId, {
      transportRoute: transport.routeName,
      pickupStop: pickupStop || 'Main Stop',
      transportFee: calculatedFee
    });

    ok(res, transport);
  } catch (e) { err(res, e.message); }
};

const removeStudentFromTransport = async (req, res) => {
  try {
    const { studentId } = req.body;
    const transport = await Transport.findById(req.params.id);
    if (!transport) return err(res, 'Transport route not found');

    transport.assignedStudents = (transport.assignedStudents || []).filter(s => String(s.studentId) !== String(studentId));
    await transport.save();

    await Student.findByIdAndUpdate(studentId, { transportRoute: '', pickupStop: '' });

    ok(res, transport);
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
      feesDocs,
      studentsList
    ] = await Promise.all([
      Student.countDocuments({ schoolId }),
      StaffHRMS.countDocuments({ schoolId, isArchived: false }),
      Exam.countDocuments({ schoolId }),
      LibraryBook.countDocuments({ schoolId, isArchived: false }),
      Transport.countDocuments({ schoolId }),
      LeaveRequest.countDocuments({ schoolId, status: 'PENDING' }),
      Helpdesk.countDocuments({ schoolId, status: 'OPEN' }),
      Payroll.countDocuments({ schoolId, status: 'GENERATED' }),
      StudentFee.find({ schoolId }),
      Student.find({ schoolId }, 'grade className classId').lean()
    ]);

    let feeCollected = 0;
    let feeTarget = 0;
    (feesDocs || []).forEach(f => {
      const tgt = Number(f.totalAmount || f.amount || 0);
      const paid = Number(f.paidAmount || (f.status === 'PAID' ? tgt : 0));
      feeTarget += tgt;
      feeCollected += paid;
    });

    // Dynamic grade distribution
    const gradeBreakdown = {};
    (studentsList || []).forEach(s => {
      const k = s.grade || s.className || 'General';
      gradeBreakdown[k] = (gradeBreakdown[k] || 0) + 1;
    });

    ok(res, {
      totalStudents, totalStaff, totalExams, totalLibraryBooks,
      totalTransport, pendingLeaves, openTickets, pendingPayrolls,
      feeCollected, feeTarget, gradeBreakdown
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
  getClasses, createClass, createClassesBulk, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  // HR Setup
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  // People
  getStudentList, createStudentRecord, updateStudentRecord, deleteStudentRecord, promoteStudents,
  enrollStudentWithAccounts, enrollStudentsBulk, previewNextRollNo,
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  // Attendance
  getStudentAttendance, markStudentAttendance,
  getStaffAttendance, markStaffAttendance, approveStaffAttendanceCorrection,
  // Academics
  getExams, createExam, updateExam, deleteExam, publishExam,
  getMarks, createMark, updateMark, deleteMark, publishMarks, approveMarkWorkflow,
  getHomework, createHomework, updateHomework, deleteHomework, verifyHomeworkSubmission,
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
  getTransport, createTransport, updateTransport, deleteTransport, assignStudentToTransport, removeStudentFromTransport,
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

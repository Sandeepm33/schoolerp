const { School, User, Student, Admission } = require('../models/coreModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. AUTHENTICATION & LOGIN (WITH TENANT STATUS CHECK)
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or account does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 🛑 BLOCK LOGIN IF TENANT SCHOOL IS SUSPENDED
    if (user.role !== 'SAAS_SUPER_ADMIN' && user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (school && school.status !== 'ACTIVE') {
        return res.status(403).json({
          message: `❌ Account Access Blocked: School tenant '${school.name}' is currently ${school.status}. Please contact platform admin.`
        });
      }
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        email: user.email, 
        name: user.name,
        schoolId: user.schoolId 
      },
      process.env.JWT_SECRET || 'super_secret_school_erp_jwt_key_2026_safe',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.schoolName || 'Greenwood International School'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // For PARENT role: attach the linked child student record
    if (user.role === 'PARENT' && user.mappedStudentId) {
      const { Student } = require('../models/coreModels');
      const mappedStudent = await Student.findById(user.mappedStudentId).select(
        'firstName lastName classId sectionId rollNo admissionNo attendancePercentage gender'
      );
      return res.json({ ...user.toObject(), mappedStudent: mappedStudent || null });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// 🔑 SCHOOL ADMIN USER ROLE MANAGEMENT (100% CRUD)
// ==========================================

const getSchoolUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'SAAS_SUPER_ADMIN' && req.user.schoolId) {
      query.schoolId = req.user.schoolId;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSchoolUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const allowedRoles = ['SCHOOL_ADMIN', 'ACCOUNTANT', 'TEACHER', 'PARENT', 'STUDENT'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role '${role}'. Allowed roles: ${allowedRoles.join(', ')}` });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: `User with email '${cleanEmail}' is already registered.` });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const newUser = new User({
      schoolId: req.user.schoolId || 'default_school_id',
      schoolName: req.user.schoolName || 'School Campus',
      name: name || 'New User',
      email: cleanEmail,
      password: hashedPassword,
      role,
      phone: phone || ''
    });

    await newUser.save();

    res.status(201).json({
      message: `User '${newUser.name}' created with role [${newUser.role}]!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSchoolUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User account not found' });

    if (user.role === 'SAAS_SUPER_ADMIN') {
      return res.status(403).json({ message: 'Cannot delete Super Admin account' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: `User account '${user.name}' (${user.email}) deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMISSION CONTROLLER (ROBUST APPLICATION SAVER)
// ==========================================

const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdmission = async (req, res) => {
  try {
    const { applicantName, studentName, parentName, targetClass, phone, email, previousSchool, status } = req.body;
    
    const count = await Admission.countDocuments().catch(() => 0);
    const appNo = `APP-2026-${1000 + count + 1}`;
    const cleanApplicantName = applicantName || studentName || 'New Applicant';

    const newAdmission = new Admission({
      schoolId: req.user?.schoolId,
      applicationNo: appNo,
      applicantName: cleanApplicantName,
      parentName: parentName || 'Parent / Guardian',
      targetClass: targetClass || 'Class 10',
      phone: phone || '9999999999',
      email: (email || 'applicant@school.com').toLowerCase().trim(),
      previousSchool: previousSchool || '',
      status: status || 'SUBMITTED'
    });

    await newAdmission.save();
    res.status(201).json({ message: 'Application submitted successfully!', admission: newAdmission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const admission = await Admission.findById(id);
    if (!admission) return res.status(404).json({ message: 'Admission application not found' });

    admission.status = status;
    await admission.save();

    if (status === 'ACCEPTED' || status === 'APPROVED' || status === 'CONFIRMED') {
      const count = await Student.countDocuments().catch(() => 0);
      const admNo = `ADM-2026-${100 + count}`;
      const nameParts = (admission.applicantName || 'Student').split(' ');

      const newStudent = new Student({
        firstName: nameParts[0] || 'Student',
        lastName: nameParts.slice(1).join(' ') || 'Student',
        admissionNo: admNo,
        classId: admission.targetClass || 'Class 10',
        sectionId: 'Section A',
        rollNo: `${count + 1}`,
        gender: 'Male',
        parentName: admission.parentName,
        parentEmail: admission.email,
        parentPhone: admission.phone,
        address: 'Enrolled via Online Pipeline'
      });

      await newStudent.save();
    }

    res.json({ message: `Admission status updated to ${status}`, admission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  getSchoolUsers,
  createSchoolUser,
  deleteSchoolUser,
  getAdmissions,
  createAdmission,
  updateAdmissionStatus
};

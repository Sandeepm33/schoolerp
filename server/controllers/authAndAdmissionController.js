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

    let userObj = user.toObject();
    const { School, Student } = require('../models/coreModels');

    if (userObj.schoolId) {
      const school = await School.findById(userObj.schoolId);
      if (school) userObj.schoolName = school.name.trim();
    }

    if (!userObj.schoolName) {
      const activeSchool = await School.findOne({ status: 'ACTIVE' });
      if (activeSchool) userObj.schoolName = activeSchool.name.trim();
    }

    if (!userObj.schoolName) {
      userObj.schoolName = 'SVM School';
    }

    // Attach mapped student details for STUDENT or PARENT roles
    let studentRecord = null;
    if (user.role === 'STUDENT') {
      if (user._id) {
        studentRecord = await Student.findOne({
          $or: [
            { studentUserId: user._id },
            { studentUserId: String(user._id) },
            { studentEmail: user.email },
            { email: user.email }
          ]
        });
      }
      if (!studentRecord && user.name) {
        const parts = user.name.trim().split(' ');
        const fName = parts[0];
        studentRecord = await Student.findOne({ firstName: { $regex: new RegExp(`^${fName}$`, 'i') } });
      }
    } else if (user.role === 'PARENT') {
      if (user.mappedStudentId) {
        studentRecord = await Student.findById(user.mappedStudentId);
      }
      if (!studentRecord && user._id) {
        studentRecord = await Student.findOne({
          $or: [
            { parentId: user._id },
            { parentId: String(user._id) },
            { parentEmail: user.email }
          ]
        });
      }
    }

    if (studentRecord) {
      userObj.mappedStudent = {
        _id: studentRecord._id,
        firstName: studentRecord.firstName,
        lastName: studentRecord.lastName,
        classId: studentRecord.classId,
        sectionId: studentRecord.sectionId,
        rollNo: studentRecord.rollNo,
        admissionNo: studentRecord.admissionNo,
        attendancePercentage: studentRecord.attendancePercentage,
        gender: studentRecord.gender,
        parentName: studentRecord.parentName,
        parentPhone: studentRecord.parentPhone,
        parentEmail: studentRecord.parentEmail,
      };
    } else {
      userObj.mappedStudent = null;
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, avatar, designation, bio, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User account not found' });

    // Students and Parents have read-only profiles
    if (['STUDENT', 'PARENT'].includes(user.role) && (name || phone || avatar || designation || bio)) {
      return res.status(403).json({ message: 'Profile details for Students and Parents are read-only and managed by School Administration.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Ensure schoolName is set if missing
    if (!user.schoolName && user.schoolId) {
      const { School } = require('../models/coreModels');
      const school = await School.findById(user.schoolId);
      if (school) user.schoolName = school.name.trim();
    }

    // Optional password change
    if (newPassword) {
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password does not match.' });
        }
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    let userObj = updatedUser.toObject();

    if (!userObj.schoolName && userObj.schoolId) {
      const { School } = require('../models/coreModels');
      const school = await School.findById(userObj.schoolId);
      if (school) userObj.schoolName = school.name.trim();
    }

    res.json({
      message: 'Profile updated successfully!',
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateThemePreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { themeConfig } = req.body;

    if (!themeConfig) {
      return res.status(400).json({ message: 'themeConfig object is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User account not found' });

    user.themePreference = themeConfig;
    await user.save();

    res.json({
      message: 'Theme preference saved successfully!',
      themePreference: user.themePreference
    });
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
    const { name, email, password, role, phone, mappedStudentId, status } = req.body;
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
      phone: phone || '',
      status: status || 'ACTIVE',
      mappedStudentId: mappedStudentId || null
    });

    await newUser.save();

    if (mappedStudentId) {
      await Student.findByIdAndUpdate(mappedStudentId, {
        parentName: newUser.name,
        parentEmail: newUser.email,
        parentPhone: newUser.phone
      });
    }

    res.status(201).json({
      message: `User '${newUser.name}' created with role [${newUser.role}]!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        mappedStudentId: newUser.mappedStudentId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSchoolUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, status, mappedStudentId } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User account not found' });

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (status) user.status = status;
    if (mappedStudentId !== undefined) user.mappedStudentId = mappedStudentId || null;
    if (password && password.trim()) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    if (user.mappedStudentId) {
      await Student.findByIdAndUpdate(user.mappedStudentId, {
        parentName: user.name,
        parentEmail: user.email,
        parentPhone: user.phone
      });
    }

    res.json({ message: `User '${user.name}' updated successfully!`, user });
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
  updateProfile,
  updateThemePreference,
  getSchoolUsers,
  createSchoolUser,
  updateSchoolUser,
  deleteSchoolUser,
  getAdmissions,
  createAdmission,
  updateAdmissionStatus
};

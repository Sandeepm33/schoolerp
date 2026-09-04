const mongoose = require('mongoose');

// 1. SCHOOL SCHEMA (SAAS MULTI-TENANCY)
const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  subscriptionPlan: { type: String, enum: ['ENTERPRISE', 'PRO', 'BASIC'], default: 'ENTERPRISE' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  logo: { type: String, default: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop' },
  createdAt: { type: Date, default: Date.now }
});

// 2. USER SCHEMA (WITH SAAS_SUPER_ADMIN & SCHOOL_ID)
const UserSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  schoolName: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SAAS_SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'HEAD_MASTER', 'ACCOUNTANT', 'TEACHER', 'PARENT', 'STUDENT', 'DRIVER', 'SECURITY'],
    required: true 
  },


  phone: { type: String },
  designation: { type: String },
  bio: { type: String },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  // Parent-Student link: PARENT users store their child's Student _id here
  mappedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  themePreference: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

// 3. STUDENT SCHEMA (WITH DYNAMIC ATTENDANCE METER & COUNTERS)
const StudentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  admissionNo: { type: String, required: true, unique: true },
  rollNo: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  classId: { type: String, required: true },
  sectionId: { type: String, required: true },
  // Student's own login User account
  studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  studentEmail: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentName: { type: String },
  parentPhone: { type: String },
  parentEmail: { type: String },
  address: { type: String },
  bloodGroup: { type: String, default: 'O+' },
  attendancePercentage: { type: Number, default: 92 },
  totalPresent: { type: Number, default: 23 },
  totalClasses: { type: Number, default: 25 },
  documents: [{
    docType: String,
    title: String,
    url: String,
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' }
  }],
  healthRecord: {
    allergies: [String],
    heightCm: Number,
    weightKg: Number,
    remarks: String
  },
  discipline: [{
    incidentDate: { type: Date, default: Date.now },
    title: String,
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    actionTaken: String
  }],
  transportRoute: { type: String },
  pickupStop: { type: String },
  transportFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 4. ATTENDANCE RECORD SCHEMA
const AttendanceRecordSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String },
  classId: { type: String, required: true },
  sectionId: { type: String, default: 'Section A' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'], required: true },
  markedBy: { type: String, default: 'Teacher / Admin' }
});

// 5. ADMISSION SCHEMA (RELAXED VALIDATION WITH COMPLETE ENUMS)
const AdmissionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  applicationNo: { type: String, required: true },
  applicantName: { type: String, required: true },
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  targetClass: { type: String, required: true },
  previousSchool: { type: String },
  schoolStrength: { type: String, default: '' },
  strengthOfSchools: { type: String, default: '' },
  description: { type: String, default: '' },
  text: { type: String, default: '' },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'PENDING', 'UNDER_VERIFICATION', 'DOCUMENTS_PENDING', 'SELECTED', 'ACCEPTED', 'APPROVED', 'REJECTED', 'CONFIRMED'],
    default: 'SUBMITTED'
  },
  notes: { type: String },
  appliedAt: { type: Date, default: Date.now }
}, { strict: false });

// 6. FEE SCHEMA (ADMIN / ACCOUNTANT ONLY)
const FeeStructureSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  academicYear: { type: String, default: '2026-2027' },
  targetClass: { type: String, required: true },
  tuitionFee: { type: Number, default: 0 },
  developmentFee: { type: Number, default: 0 },
  examFee: { type: Number, default: 0 },
  labFee: { type: Number, default: 0 },
  otherFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const StudentFeeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
  academicYear: { type: String, default: '2026-2027' },
  totalDue: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  status: { type: String, enum: ['PAID', 'PARTIAL', 'OVERDUE', 'UNPAID'], default: 'UNPAID' },
  payments: [{
    receiptNo: String,
    amount: Number,
    paymentMode: { type: String, enum: ['CASH', 'CHEQUE', 'ONLINE_UPI', 'BANK_TRANSFER'], default: 'CASH' },
    paidDate: { type: Date, default: Date.now },
    recordedBy: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

// 7. TIMETABLE SCHEMA
const TimetableSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  classId: { type: String, required: true },
  sectionId: { type: String, required: true },
  academicYear: { type: String, default: '2026-2027' },
  periods: [{
    periodNo: Number,
    name: String,
    startTime: String,
    endTime: String,
    isBreak: { type: Boolean, default: false }
  }],
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    periodNo: Number,
    periodName: String,
    startTime: String,
    endTime: String,
    subject: String,
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherName: String,
    roomNo: String,
    periods: [{
      periodNo: Number,
      startTime: String,
      endTime: String,
      subject: String,
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      teacherName: String,
      roomNo: String
    }]
  }],
  generatedByAI: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

// 8. INVENTORY SCHEMA
const InventorySchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  unitPrice: { type: Number, default: 0 },
  location: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// 9. CERTIFICATE SCHEMA
const CertificateSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  certificateNo: { type: String, required: true, unique: true },
  certificateType: { type: String, enum: ['TRANSFER_CERTIFICATE', 'MERIT_CERTIFICATE', 'CHARACTER_CERTIFICATE'], required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  issueReason: { type: String },
  issuedBy: { type: String, required: true }
});

// Force fresh model recompilation for User, Student & Admission schema additions
delete mongoose.models.User;
delete mongoose.models.Student;
delete mongoose.models.Admission;

module.exports = {
  School: mongoose.models.School || mongoose.model('School', SchoolSchema),
  User: mongoose.model('User', UserSchema),

  Student: mongoose.model('Student', StudentSchema),
  AttendanceRecord: mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord', AttendanceRecordSchema),
  Admission: mongoose.model('Admission', AdmissionSchema),
  FeeStructure: mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema),
  StudentFee: mongoose.models.StudentFee || mongoose.model('StudentFee', StudentFeeSchema),
  Timetable: mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema),
  Inventory: mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema),
  Certificate: mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema)
};

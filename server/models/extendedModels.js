const mongoose = require('mongoose');

// 1. TIMETABLE SCHEMA
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
    teacherName: String,
    roomNo: String
  }]
}, { timestamps: true, strict: false });

// 2. EXAM & MARKS SCHEMA
const ExamSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  examType: { type: String, default: 'Mid-Term' },
  targetClass: { type: String },
  subjects: [String],
  startDate: Date,
  endDate: Date,
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 35 },
  subjectSchedules: [{
    subjectName: String,
    examDate: String,
    startTime: String,
    endTime: String,
    totalMarks: Number,
    passingMarks: Number
  }],
  isPublished: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  academicYear: { type: String, default: '2026-2027' },
  createdAt: { type: Date, default: Date.now }
});

const MarkSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examTitle: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  rollNo: String,
  classId: String,
  sectionId: String,
  subjectName: String,
  subjectMarks: [{
    subject: String,
    marksObtained: Number,
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 35 },
    grade: String,
    remarks: String
  }],
  totalMarksObtained: Number,
  totalMaxMarks: Number,
  percentage: Number,
  rank: Number,
  approvalStatus: { type: String, default: 'PUBLISHED' }, // SUBMITTED_BY_TEACHER | APPROVED_BY_PRINCIPAL | APPROVED_BY_HEADMASTER | PUBLISHED | REJECTED
  submittedBy: {
    name: String,
    role: String,
    date: { type: Date, default: Date.now }
  },
  principalApproval: {
    approvedBy: String,
    approvedAt: Date,
    comments: String
  },
  headmasterApproval: {
    approvedBy: String,
    approvedAt: Date,
    comments: String
  },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 3. HOMEWORK & LMS SCHEMA
const HomeworkSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  classId: { type: String, required: true },
  sectionId: { type: String },
  subject: { type: String, required: true },
  teacherName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String },
  attachmentUrl: { type: String },
  isPublished: { type: Boolean, default: true },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    submittedAt: { type: Date, default: Date.now },
    fileUrl: String,
    answerText: String,
    status: { type: String, enum: ['SUBMITTED', 'GRADED'], default: 'SUBMITTED' },
    grade: String,
    teacherComment: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const LMSContentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  classId: { type: String, required: true },
  subject: { type: String, required: true },
  contentType: { type: String, enum: ['PDF', 'VIDEO', 'NOTE', 'QUESTION_BANK', 'ASSIGNMENT'], default: 'PDF' },
  fileUrl: { type: String },
  description: { type: String },
  uploadedBy: { type: String },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 4. TRANSPORT SCHEMA
const TransportSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  vehicleNo: { type: String, required: true },
  vehicleType: { type: String, default: 'Bus' },
  capacity: { type: Number, default: 40 },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  helperName: { type: String },
  helperPhone: { type: String },
  routeName: { type: String, required: true },
  monthlyFee: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  stops: [{
    stopName: String,
    monthlyFee: { type: Number, default: 0 },
    pickupTime: String,
    dropTime: String
  }],
  assignedStudents: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    rollNo: String,
    classId: String,
    sectionId: String,
    pickupStop: String,
    monthlyFee: { type: Number, default: 0 },
    parentPhone: String,
    assignedAt: { type: Date, default: Date.now }
  }],
  currentLocation: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    lastUpdated: { type: Date, default: Date.now },
    status: { type: String, enum: ['ON_ROUTE', 'STOPPED', 'IDLE'], default: 'ON_ROUTE' }
  }
}, { timestamps: true, strict: false });

// 5. INVENTORY SCHEMA
const InventorySchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  itemName: { type: String, required: true },
  itemCode: { type: String },
  category: { type: String, enum: ['Stationery', 'Furniture', 'Computers', 'Lab Equipment', 'Sports', 'Books', 'Uniform', 'Consumables', 'Other'], required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'Pcs' },
  minStockAlert: { type: Number, default: 5 },
  vendorName: { type: String },
  purchasePrice: { type: Number, default: 0 },
  lastRestocked: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 6. STAFF HRMS & PAYROLL SCHEMA
const StaffHRMSSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  photo: { type: String },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  employeeType: { type: String, default: 'TEACHER' },


  joiningDate: { type: Date, default: Date.now },
  qualification: { type: String },
  experience: { type: String },
  subjects: [String],
  assignedClasses: [String],
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], default: 'ACTIVE' },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 7. CERTIFICATE SCHEMA
const CertificateSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  certificateNo: { type: String, required: true, unique: true },
  certificateType: { type: String, enum: ['BONAFIDE', 'TRANSFER_CERTIFICATE', 'CONDUCT', 'CHARACTER', 'MERIT', 'EXPERIENCE', 'STUDY', 'CUSTOM'], required: true },
  issuedToName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  classId: { type: String },
  targetRole: { type: String, enum: ['STUDENT', 'STAFF'], default: 'STUDENT' },
  issueDate: { type: Date, default: Date.now },
  purpose: { type: String },
  issuedBy: { type: String },
  status: { type: String, enum: ['ISSUED', 'REVOKED'], default: 'ISSUED' },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 8. HELPDESK / COMPLAINTS SCHEMA
const HelpdeskSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  ticketId: { type: String, required: true, unique: true },
  raisedByName: { type: String, required: true },
  raisedByRole: { type: String, required: true },
  category: { type: String, enum: ['Academics', 'Transport', 'Hostel', 'IT Support', 'Maintenance', 'Finance', 'Other'], required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  assignedTo: { type: String },
  status: { type: String, enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  comments: [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 9. ACADEMIC YEAR SCHEMA
const AcademicYearSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'CLOSED', 'ARCHIVED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

// 10. CLASS / SECTION / SUBJECT SCHEMAS
const ClassRoomSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  className: { type: String, required: true },
  classTeacher: { type: String },
  capacity: { type: Number, default: 40 },
  sections: [String],
  subjects: [String],
  academicYear: { type: String, default: '2026-2027' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const SubjectSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  subjectType: { type: String, enum: ['CORE', 'ELECTIVE', 'LANGUAGE', 'PRACTICAL', 'CO-CURRICULAR'], default: 'CORE' },
  examType: { type: String, enum: ['THEORY', 'PRACTICAL', 'BOTH'], default: 'THEORY' },
  assignedClasses: [String],
  periodsPerWeek: { type: Number, default: 5 },
  maxMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 35 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 11. DEPARTMENT & DESIGNATION SCHEMAS
const DepartmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  name: { type: String, required: true },
  head: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const DesignationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  department: { type: String },
  level: { type: String, enum: ['JUNIOR', 'MID', 'SENIOR', 'HEAD', 'MANAGEMENT'], default: 'MID' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 12. LEAVE TYPE & REQUEST SCHEMAS
const LeaveTypeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  name: { type: String, required: true },
  code: { type: String, required: true },
  daysAllowed: { type: Number, default: 12 },
  applicableTo: { type: String, enum: ['STAFF', 'STUDENT', 'BOTH'], default: 'STAFF' },
  isPaid: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const LeaveRequestSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  applicantId: { type: mongoose.Schema.Types.ObjectId },
  applicantName: { type: String, required: true },
  applicantRole: { type: String, required: true },
  leaveType: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number, default: 1 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  approvedBy: { type: String },
  remarks: { type: String },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 13. PAYROLL SCHEMA
const PayrollSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  hraAllowance: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  lop: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['GENERATED', 'APPROVED', 'PAID', 'ON_HOLD'], default: 'GENERATED' },
  paymentDate: { type: Date },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 14. LIBRARY SCHEMA
const LibraryBookSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, required: true },
  publisher: { type: String },
  edition: { type: String },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  shelfLocation: { type: String },
  status: { type: String, enum: ['AVAILABLE', 'ISSUED', 'LOST', 'DAMAGED'], default: 'AVAILABLE' },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const LibraryTransactionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook' },
  bookTitle: { type: String },
  borrowerName: { type: String, required: true },
  borrowerRole: { type: String, default: 'STUDENT' },
  borrowerClass: { type: String },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fineAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'], default: 'ISSUED' },
  createdAt: { type: Date, default: Date.now }
});

// 15. HOSTEL SCHEMA
const HostelRoomSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  hostelName: { type: String, required: true },
  building: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'], default: 'DOUBLE' },
  capacity: { type: Number, default: 2 },
  occupied: { type: Number, default: 0 },
  floor: { type: String },
  amenities: [String],
  monthlyFee: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const HostelAllocationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom' },
  roomNumber: { type: String },
  hostelName: { type: String },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  classId: { type: String },
  allocatedDate: { type: Date, default: Date.now },
  vacatingDate: { type: Date },
  bedNumber: { type: String },
  status: { type: String, enum: ['ACTIVE', 'VACATED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

// 16. HEALTH RECORD SCHEMA
const HealthRecordSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  classId: { type: String },
  bloodGroup: { type: String },
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: { name: String, phone: String, relationship: String },
  checkups: [{
    date: { type: Date, default: Date.now },
    doctorName: String,
    height: Number,
    weight: Number,
    vision: String,
    hearing: String,
    notes: String
  }],
  incidents: [{
    date: { type: Date, default: Date.now },
    type: String,
    description: String,
    actionTaken: String,
    reportedBy: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// 17. DISCIPLINE SCHEMA
const DisciplineSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  classId: { type: String },
  incidentDate: { type: Date, required: true },
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  actionTaken: { type: String },
  parentNotified: { type: Boolean, default: false },
  counsellingRequired: { type: Boolean, default: false },
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  reportedBy: { type: String },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 18. EVENTS SCHEMA
const EventSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Academic', 'Sports', 'Cultural', 'Holiday', 'Meeting', 'Other'], default: 'Academic' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  venue: { type: String },
  organizer: { type: String },
  targetAudience: { type: String, enum: ['ALL', 'STUDENTS', 'STAFF', 'PARENTS'], default: 'ALL' },
  isPublished: { type: Boolean, default: false },
  registrationRequired: { type: Boolean, default: false },
  participants: [{ name: String, role: String, registeredAt: { type: Date, default: Date.now } }],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 19. VISITOR SCHEMA
const VisitorSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  visitorName: { type: String, required: true },
  phone: { type: String },
  purposeOfVisit: { type: String, required: true },
  personToMeet: { type: String, required: true },
  department: { type: String },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  idProofType: { type: String, enum: ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'OTHER'] },
  status: { type: String, enum: ['CHECKED_IN', 'CHECKED_OUT'], default: 'CHECKED_IN' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 20. ANNOUNCEMENT / COMMUNICATION SCHEMA
const AnnouncementSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['ANNOUNCEMENT', 'CIRCULAR', 'NOTICE', 'ALERT'], default: 'ANNOUNCEMENT' },
  targetAudience: { type: String, enum: ['ALL', 'STUDENTS', 'PARENTS', 'STAFF', 'TEACHERS'], default: 'ALL' },
  channels: [{ type: String, enum: ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP'] }],
  isPublished: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  publishedAt: { type: Date },
  createdBy: { type: String },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 21. FEE CATEGORY & STRUCTURE SCHEMAS
const FeeCategorySchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const FeeStructureSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  name: { type: String, required: true },
  academicYear: { type: String, default: '2026-2027' },
  classId: { type: String },
  components: [{
    categoryName: String,
    amount: Number,
    frequency: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'], default: 'ANNUAL' }
  }],
  totalAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 22. SCHOOL AUDIT LOG SCHEMA (renamed to SchoolAuditLog to avoid collision with SaaS AuditLog)
const SchoolAuditLogSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  userId: { type: String },
  userName: { type: String },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  device: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 23. STAFF ATTENDANCE SCHEMA
const StaffAttendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  date: { type: String, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffName: { type: String, required: true },
  department: { type: String },
  checkIn: { type: String },
  checkOut: { type: String },
  method: { type: String, enum: ['GPS', 'QR', 'BIOMETRIC', 'MANUAL'], default: 'GPS' },
  location: { lat: Number, lng: Number, address: String },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'], default: 'PRESENT' },
  correctionRequest: {
    requested: { type: Boolean, default: false },
    reason: String,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
  },
  createdAt: { type: Date, default: Date.now }
});

// 24. ATTENDANCE SESSION SCHEMA — Core lockable attendance submission per class/date
const AttendanceSessionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  academicYear: { type: String, default: '2026-2027' },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  classId: { type: String, required: true },
  sectionId: { type: String, required: true },
  type: { type: String, enum: ['DAILY', 'PERIOD'], default: 'DAILY' },
  periodNo: { type: Number, default: null },
  subject: { type: String, default: null },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  teacherName: { type: String, default: null },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'LOCKED'], default: 'DRAFT' },
  submittedAt: { type: Date, default: null },
  lockedAt: { type: Date, default: null },
  // Per-student entries
  entries: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String },
    rollNo: { type: String },
    // P=Present A=Absent L=Late HD=Half-Day LV=Leave OD=Official-Duty H=Holiday W=Weekend NM=Not-Marked
    status: { type: String, enum: ['P', 'A', 'L', 'HD', 'LV', 'OD', 'H', 'W', 'NM'], default: 'NM' },
    remarks: { type: String, default: '' },
    inTime: { type: String, default: null },
    outTime: { type: String, default: null },
    source: { type: String, enum: ['MANUAL', 'BIOMETRIC', 'GPS', 'AUTO'], default: 'MANUAL' }
  }],
  // Summary computed on submit
  summary: {
    total: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    halfDay: { type: Number, default: 0 },
    leave: { type: Number, default: 0 },
    od: { type: Number, default: 0 },
    notMarked: { type: Number, default: 0 }
  },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  markedByName: { type: String, default: null },
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: String, default: null }
}, { timestamps: true });

// Compound index to prevent duplicate sessions for same class/date/type/period
AttendanceSessionSchema.index({ schoolId: 1, date: 1, classId: 1, sectionId: 1, type: 1, periodNo: 1 }, { unique: true, sparse: true });

// 25. ATTENDANCE CORRECTION REQUEST SCHEMA
const AttendanceCorrectionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  date: { type: String, required: true },
  classId: { type: String, required: true },
  sectionId: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String },
  oldStatus: { type: String, enum: ['P', 'A', 'L', 'HD', 'LV', 'OD', 'H', 'W', 'NM'] },
  newStatus: { type: String, enum: ['P', 'A', 'L', 'HD', 'LV', 'OD', 'H', 'W', 'NM'], required: true },
  reason: { type: String, required: true },
  supportingDoc: { type: String, default: null }, // URL to uploaded doc
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedByName: { type: String },
  requestedByRole: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  adminRemarks: { type: String, default: null },
  auditLog: [{
    action: String,
    by: String,
    byRole: String,
    at: { type: Date, default: Date.now },
    note: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// 26. ATTENDANCE SETTING SCHEMA — Per-school configuration
const AttendanceSettingSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', unique: true },
  mode: { type: String, enum: ['DAILY', 'PERIOD', 'HYBRID'], default: 'HYBRID' },
  workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  lateThresholdMinutes: { type: Number, default: 15 }, // minutes after school start = late
  halfDayEnabled: { type: Boolean, default: true },
  halfDayCutoffTime: { type: String, default: '12:00' },
  lockAfterSubmit: { type: Boolean, default: true },
  lockDelayMinutes: { type: Number, default: 0 }, // 0 = immediate lock on submit
  requireAdminApprovalForCorrections: { type: Boolean, default: true },
  allowTeacherSelfCorrection: { type: Boolean, default: false },
  lowAttendanceThreshold: { type: Number, default: 75 }, // % below which alert fires
  enabledStatuses: {
    type: [String],
    default: ['P', 'A', 'L', 'HD', 'LV', 'OD', 'NM']
  },
  notifyParentOnAbsent: { type: Boolean, default: true },
  notifyParentOnLowAttendance: { type: Boolean, default: true },
  schoolStartTime: { type: String, default: '08:30' },
  schoolEndTime: { type: String, default: '16:30' },
  updatedAt: { type: Date, default: Date.now }
});

if (mongoose.models) {
  delete mongoose.models.StaffHRMS;
  delete mongoose.models.Transport;
}

const TransportModel = mongoose.models.Transport || mongoose.model('Transport', TransportSchema);
if (TransportModel && TransportModel.schema) {
  TransportModel.schema.add({
    helperName: { type: String, default: '' },
    helperPhone: { type: String, default: '' },
    monthlyFee: { type: Number, default: 0 }
  });
  if (TransportModel.schema.path('stops') && TransportModel.schema.path('stops').schema) {
    TransportModel.schema.path('stops').schema.add({
      pickupTime: { type: String, default: '07:30 AM' },
      dropTime: { type: String, default: '04:30 PM' }
    });
  }
}

module.exports = {
  Timetable: mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema),
  Exam: mongoose.models.Exam || mongoose.model('Exam', ExamSchema),
  Mark: mongoose.models.Mark || mongoose.model('Mark', MarkSchema),
  Homework: mongoose.models.Homework || mongoose.model('Homework', HomeworkSchema),
  LMSContent: mongoose.models.LMSContent || mongoose.model('LMSContent', LMSContentSchema),
  Transport: TransportModel,
  Inventory: mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema),
  StaffHRMS: mongoose.model('StaffHRMS', StaffHRMSSchema),

  Certificate: mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema),
  Helpdesk: mongoose.models.Helpdesk || mongoose.model('Helpdesk', HelpdeskSchema),
  AcademicYear: mongoose.models.AcademicYear || mongoose.model('AcademicYear', AcademicYearSchema),
  ClassRoom: mongoose.models.ClassRoom || mongoose.model('ClassRoom', ClassRoomSchema),
  Subject: mongoose.models.Subject || mongoose.model('Subject', SubjectSchema),
  Department: mongoose.models.Department || mongoose.model('Department', DepartmentSchema),
  Designation: mongoose.models.Designation || mongoose.model('Designation', DesignationSchema),
  LeaveType: mongoose.models.LeaveType || mongoose.model('LeaveType', LeaveTypeSchema),
  LeaveRequest: mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema),
  Payroll: mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema),
  LibraryBook: mongoose.models.LibraryBook || mongoose.model('LibraryBook', LibraryBookSchema),
  LibraryTransaction: mongoose.models.LibraryTransaction || mongoose.model('LibraryTransaction', LibraryTransactionSchema),
  HostelRoom: mongoose.models.HostelRoom || mongoose.model('HostelRoom', HostelRoomSchema),
  HostelAllocation: mongoose.models.HostelAllocation || mongoose.model('HostelAllocation', HostelAllocationSchema),
  HealthRecord: mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema),
  Discipline: mongoose.models.Discipline || mongoose.model('Discipline', DisciplineSchema),
  Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
  Visitor: mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema),
  Announcement: mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema),
  FeeCategory: mongoose.models.FeeCategory || mongoose.model('FeeCategory', FeeCategorySchema),
  FeeStructure: mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema),
  SchoolAuditLog: mongoose.models.SchoolAuditLog || mongoose.model('SchoolAuditLog', SchoolAuditLogSchema),
  StaffAttendance: mongoose.models.StaffAttendance || mongoose.model('StaffAttendance', StaffAttendanceSchema),
  AttendanceSession: mongoose.models.AttendanceSession || mongoose.model('AttendanceSession', AttendanceSessionSchema),
  AttendanceCorrection: mongoose.models.AttendanceCorrection || mongoose.model('AttendanceCorrection', AttendanceCorrectionSchema),
  AttendanceSetting: mongoose.models.AttendanceSetting || mongoose.model('AttendanceSetting', AttendanceSettingSchema),
};

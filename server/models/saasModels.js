const mongoose = require('mongoose');

// 1. SUBSCRIPTION PLAN SCHEMA (DYNAMIC FEATURE MATRIX & LIMITS)
const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  priceMonthly: { type: Number, default: 0 },
  priceAnnual: { type: Number, default: 0 },
  studentLimit: { type: Number, default: 500 },
  teacherLimit: { type: Number, default: 50 },
  staffLimit: { type: Number, default: 50 },
  branchLimit: { type: Number, default: 1 },
  storageLimitGb: { type: Number, default: 10 },
  aiTokenLimit: { type: Number, default: 10000 },
  features: {
    admissions: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    exams: { type: Boolean, default: true },
    payroll: { type: Boolean, default: false },
    transport: { type: Boolean, default: false },
    library: { type: Boolean, default: false },
    hrms: { type: Boolean, default: false },
    hostel: { type: Boolean, default: false },
    ai: { type: Boolean, default: false },
    api: { type: Boolean, default: false },
    multiBranch: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. SCHOOL BRANCH SCHEMA (MULTI-BRANCH TENANCY)
const BranchSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  schoolName: { type: String },
  branchName: { type: String, required: true },
  branchCode: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  address: { type: String },
  principalName: { type: String },
  contactPhone: { type: String },
  maxStudents: { type: Number, default: 500 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

// 3. SAAS SUBSCRIPTION INVOICE SCHEMA
const SaaSInvoiceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  schoolName: { type: String },
  invoiceNo: { type: String, required: true, unique: true },
  planName: { type: String },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE', 'CANCELLED'], default: 'PAID' },
  paymentMethod: { type: String, default: 'STRIPE/CARD' },
  billingCycle: { type: String, enum: ['MONTHLY', 'ANNUAL'], default: 'ANNUAL' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

// 4. AUDIT LOG SCHEMA (SUPER ADMIN ACTION TRACKING)
const AuditLogSchema = new mongoose.Schema({
  performedByName: { type: String, required: true },
  performedByRole: { type: String, default: 'SAAS_SUPER_ADMIN' },
  action: { type: String, required: true },
  targetSchoolName: { type: String },
  details: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

// 5. SECURITY EVENT & NETWORK CONTROLS SCHEMA
const SecurityEventSchema = new mongoose.Schema({
  eventType: { type: String, enum: ['LOGIN_SUCCESS', 'FAILED_LOGIN', 'SUSPICIOUS_IP', 'SESSION_TERMINATED', 'IP_BLOCKED'], required: true },
  userEmail: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
  deviceInfo: { type: String, default: 'Chrome / Windows' },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  timestamp: { type: Date, default: Date.now }
});

// 6. GLOBAL ANNOUNCEMENT SCHEMA
const GlobalAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetAudience: { type: String, enum: ['ALL', 'SCHOOL_ADMINS', 'TEACHERS', 'PARENTS'], default: 'ALL' },
  priority: { type: String, enum: ['NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  createdBy: { type: String, default: 'SaaS Super Admin' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 7. FEATURE FLAG SCHEMA
const FeatureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  key: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  rolloutPercentage: { type: Number, default: 100 },
  description: { type: String }
});

// 8. SUPPORT TICKET SCHEMA
const SupportTicketSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  userEmail: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  assignedAgent: { type: String, default: 'Unassigned' },
  createdAt: { type: Date, default: Date.now }
});

// 9. SALES CRM LEAD SCHEMA
const SalesLeadSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  schoolStrength: { type: String, default: '' },
  strengthOfSchools: { type: String, default: '' },
  contactPerson: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String, default: 'School Admin / Owner' },
  city: { type: String },
  description: { type: String, default: '' },
  text: { type: String, default: '' },
  stage: { type: String, enum: ['LEAD', 'DEMO_SCHEDULED', 'TRIAL_ACTIVE', 'NEGOTIATION', 'SUBSCRIBED'], default: 'LEAD' },
  expectedARR: { type: Number, default: 2990 },
  salesOwner: { type: String, default: 'Super Admin' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

delete mongoose.models.SalesLead;
delete mongoose.models.SupportTicket;
delete mongoose.models.Notification;

// 10. SYSTEM & USER NOTIFICATION SCHEMA
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INQUIRY', 'ADMISSION', 'FEE', 'ANNOUNCEMENT', 'SYSTEM'], default: 'SYSTEM' },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  targetRole: { type: String, default: 'ALL' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = {
  SubscriptionPlan: mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema),
  Branch: mongoose.models.Branch || mongoose.model('Branch', BranchSchema),
  SaaSInvoice: mongoose.models.SaaSInvoice || mongoose.model('SaaSInvoice', SaaSInvoiceSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema),
  SecurityEvent: mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema),
  GlobalAnnouncement: mongoose.models.GlobalAnnouncement || mongoose.model('GlobalAnnouncement', GlobalAnnouncementSchema),
  FeatureFlag: mongoose.models.FeatureFlag || mongoose.model('FeatureFlag', FeatureFlagSchema),
  SupportTicket: mongoose.model('SupportTicket', SupportTicketSchema),
  SalesLead: mongoose.model('SalesLead', SalesLeadSchema),
  Notification: mongoose.model('Notification', NotificationSchema)
};

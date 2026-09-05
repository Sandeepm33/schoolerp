const express = require('express');
const router = express.Router();

const { authMiddleware, blockParentFees } = require('../middleware/auth');
const authAndAdmission = require('../controllers/authAndAdmissionController');
const studentAndFee = require('../controllers/studentAndFeeController');
const academicAndOp = require('../controllers/academicAndOpControllers');
const ai = require('../controllers/aiController');
const saas = require('../controllers/saasController');
const admin = require('../controllers/schoolAdminController');
const attendance = require('../controllers/attendanceController');
const notifications = require('../controllers/notificationController');

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTH & USER MANAGEMENT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.post('/auth/login', authAndAdmission.login);
router.get('/auth/me', authMiddleware, authAndAdmission.getMe);
router.put('/auth/profile', authMiddleware, authAndAdmission.updateProfile);
router.put('/auth/theme', authMiddleware, authAndAdmission.updateThemePreference);

// School Admin User Role Creator Routes
router.get('/users', authMiddleware, authAndAdmission.getSchoolUsers);
router.post('/users', authMiddleware, authAndAdmission.createSchoolUser);
router.post('/users/create', authMiddleware, authAndAdmission.createSchoolUser);
router.put('/users/:id', authMiddleware, authAndAdmission.updateSchoolUser);
router.delete('/users/:id', authMiddleware, authAndAdmission.deleteSchoolUser);

// ─────────────────────────────────────────────────────────────────────────────
// 2. SAAS PLATFORM SUPER ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/saas/schools', authMiddleware, saas.getSchools);
router.post('/saas/schools', authMiddleware, saas.createSchool);
router.post('/saas/schools/create', authMiddleware, saas.createSchool);
router.put('/saas/schools/:id', authMiddleware, saas.updateSchool);
router.patch('/saas/schools/:id/status', authMiddleware, saas.updateSchoolStatus);
router.delete('/saas/schools/:id', authMiddleware, saas.deleteSchool);
router.post('/saas/impersonate', authMiddleware, saas.impersonateSchoolAdmin);
router.get('/saas/global-users', authMiddleware, saas.getGlobalUsers);
router.post('/saas/users/:userId/reset-password', authMiddleware, saas.resetUserPassword);
router.get('/saas/plans', authMiddleware, saas.getPlans);
router.post('/saas/plans', authMiddleware, saas.createOrUpdatePlan);
router.put('/saas/plans/:id', authMiddleware, saas.createOrUpdatePlan);
router.delete('/saas/plans/:id', authMiddleware, saas.deletePlan);
router.post('/saas/plans/toggle-feature', authMiddleware, saas.togglePlanFeature);
router.post('/saas/plans/add-feature-key', authMiddleware, saas.addCustomFeatureKey);
router.get('/saas/branches', authMiddleware, saas.getBranches);
router.post('/saas/branches', authMiddleware, saas.createBranch);
router.get('/saas/security-events', authMiddleware, saas.getSecurityEvents);
router.get('/saas/invoices', authMiddleware, saas.getSaaSInvoices);
router.get('/saas/feature-flags', authMiddleware, saas.getFeatureFlags);
router.get('/saas/tickets', authMiddleware, saas.getSupportTickets);
router.post('/saas/tickets', authMiddleware, saas.createSupportTicket);
router.post('/saas/plan-upgrade-request', authMiddleware, saas.createPlanUpgradeRequest);
router.post('/saas/schools/:id/approve-upgrade', authMiddleware, saas.approvePlanUpgradeRequest);
router.post('/saas/schools/:id/dismiss-upgrade', authMiddleware, saas.dismissPlanUpgradeRequest);
router.get('/saas/leads', authMiddleware, saas.getSalesLeads);
router.post('/saas/inquiries', saas.createInquiryLead);
router.post('/saas/leads', saas.createInquiryLead);
router.get('/saas/announcements', authMiddleware, saas.getAnnouncements);
router.post('/saas/announcements', authMiddleware, saas.createAnnouncement);
router.delete('/saas/announcements/:id', authMiddleware, saas.deleteAnnouncement);
router.get('/saas/audit-logs', authMiddleware, saas.getAuditLogs);
router.get('/saas/stats', authMiddleware, saas.getSaaSStats);

// Dynamic Landing Page Testimonials & Approval Workflow Routes
router.get('/testimonials', saas.getPublicTestimonials);
router.post('/testimonials', saas.submitTestimonial);
router.get('/saas/testimonials', authMiddleware, saas.getAdminTestimonials);
router.put('/saas/testimonials/:id/status', authMiddleware, saas.updateTestimonialStatus);
router.delete('/saas/testimonials/:id', authMiddleware, saas.deleteTestimonial);

// Dynamic Notifications Routes (Supports both /notifications and /saas/notifications)
router.get('/notifications', notifications.getNotifications);
router.get('/saas/notifications', notifications.getNotifications);

router.put('/notifications/read-all', notifications.markAllAsRead);
router.put('/saas/notifications/read-all', notifications.markAllAsRead);

router.put('/notifications/:id/read', notifications.markAsRead);
router.put('/saas/notifications/:id/read', notifications.markAsRead);

router.delete('/notifications/clear', notifications.clearNotifications);
router.delete('/saas/notifications/clear', notifications.clearNotifications);

router.post('/notifications', notifications.createNotification);
router.post('/saas/notifications', notifications.createNotification);

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADMISSIONS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admissions', authMiddleware, authAndAdmission.getAdmissions);
router.post('/admissions', authAndAdmission.createAdmission);
router.patch('/admissions/:id/status', authMiddleware, authAndAdmission.updateAdmissionStatus);

// ─────────────────────────────────────────────────────────────────────────────
// 4. STUDENTS (legacy + admin CRUD)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/students', authMiddleware, studentAndFee.getStudents);
router.get('/students/:id', authMiddleware, studentAndFee.getStudentById);
router.post('/students', authMiddleware, studentAndFee.createStudent);
router.post('/students/:id/attendance', authMiddleware, studentAndFee.markAttendance);

// Admin full CRUD for students
router.get('/admin/students', authMiddleware, admin.getStudentList);
router.post('/admin/students/enroll', authMiddleware, admin.enrollStudentWithAccounts);
router.post('/admin/students/bulk-enroll', authMiddleware, admin.enrollStudentsBulk);
router.get('/admin/students/roll-preview', authMiddleware, admin.previewNextRollNo);
router.post('/admin/students', authMiddleware, admin.createStudentRecord);
router.put('/admin/students/:id', authMiddleware, admin.updateStudentRecord);
router.delete('/admin/students/:id', authMiddleware, admin.deleteStudentRecord);
router.post('/admin/students/promote', authMiddleware, admin.promoteStudents);


// ─────────────────────────────────────────────────────────────────────────────
// 5. FEES & FINANCE (strict parent blocker)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/fees/structures', authMiddleware, blockParentFees, studentAndFee.getFeeStructures);
router.get('/fees/student-fees', authMiddleware, blockParentFees, studentAndFee.getStudentFees);
router.post('/fees/pay', authMiddleware, blockParentFees, studentAndFee.recordManualPayment);

// Admin full fee CRUD
router.get('/admin/fee-categories', authMiddleware, admin.getFeeCategories);
router.post('/admin/fee-categories', authMiddleware, admin.createFeeCategory);
router.put('/admin/fee-categories/:id', authMiddleware, admin.updateFeeCategory);
router.delete('/admin/fee-categories/:id', authMiddleware, admin.deleteFeeCategory);

router.get('/admin/fee-structures', authMiddleware, admin.getFeeStructures);
router.post('/admin/fee-structures', authMiddleware, admin.createFeeStructure);
router.put('/admin/fee-structures/:id', authMiddleware, admin.updateFeeStructure);
router.delete('/admin/fee-structures/:id', authMiddleware, admin.deleteFeeStructure);

router.get('/admin/student-fees', authMiddleware, admin.getStudentFees);
router.post('/admin/student-fees', authMiddleware, admin.createStudentFee);
router.put('/admin/student-fees/:id', authMiddleware, admin.updateStudentFee);
router.delete('/admin/student-fees/:id', authMiddleware, admin.deleteStudentFee);

// ─────────────────────────────────────────────────────────────────────────────
// 6. ACADEMIC YEAR, CLASSES, SUBJECTS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/academic-years', authMiddleware, admin.getAcademicYears);
router.post('/admin/academic-years', authMiddleware, admin.createAcademicYear);
router.put('/admin/academic-years/:id', authMiddleware, admin.updateAcademicYear);
router.delete('/admin/academic-years/:id', authMiddleware, admin.deleteAcademicYear);

router.get('/admin/classes', authMiddleware, admin.getClasses);
router.post('/admin/classes', authMiddleware, admin.createClass);
router.post('/admin/classes/bulk', authMiddleware, admin.createClassesBulk);
router.put('/admin/classes/:id', authMiddleware, admin.updateClass);
router.delete('/admin/classes/:id', authMiddleware, admin.deleteClass);

router.get('/admin/subjects', authMiddleware, admin.getSubjects);
router.post('/admin/subjects', authMiddleware, admin.createSubject);
router.put('/admin/subjects/:id', authMiddleware, admin.updateSubject);
router.delete('/admin/subjects/:id', authMiddleware, admin.deleteSubject);

// ─────────────────────────────────────────────────────────────────────────────
// 7. DEPARTMENTS & DESIGNATIONS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/departments', authMiddleware, admin.getDepartments);
router.post('/admin/departments', authMiddleware, admin.createDepartment);
router.put('/admin/departments/:id', authMiddleware, admin.updateDepartment);
router.delete('/admin/departments/:id', authMiddleware, admin.deleteDepartment);

router.get('/admin/designations', authMiddleware, admin.getDesignations);
router.post('/admin/designations', authMiddleware, admin.createDesignation);
router.put('/admin/designations/:id', authMiddleware, admin.updateDesignation);
router.delete('/admin/designations/:id', authMiddleware, admin.deleteDesignation);

// ─────────────────────────────────────────────────────────────────────────────
// 8. EMPLOYEES (HRMS)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/employees', authMiddleware, admin.getEmployees);
router.post('/admin/employees', authMiddleware, admin.createEmployee);
router.put('/admin/employees/:id', authMiddleware, admin.updateEmployee);
router.delete('/admin/employees/:id', authMiddleware, admin.deleteEmployee);

// ─────────────────────────────────────────────────────────────────────────────
// 9. ATTENDANCE — Complete School ERP Attendance System
// ─────────────────────────────────────────────────────────────────────────────

// Attendance Settings
router.get('/admin/attendance/settings', authMiddleware, attendance.getAttendanceSettings);
router.put('/admin/attendance/settings', authMiddleware, attendance.saveAttendanceSettings);

// Session Management (Draft / Submit / Lock)
router.get('/attendance/sessions', authMiddleware, attendance.getSessionsForDay);
router.get('/attendance/sessions/:id', authMiddleware, attendance.getSessionById);
router.post('/attendance/sessions/draft', authMiddleware, attendance.saveDraftSession);
router.post('/attendance/sessions/submit', authMiddleware, attendance.submitSession);
router.post('/attendance/sessions/:id/lock', authMiddleware, attendance.lockSession);

// Calendar & Summaries
router.get('/attendance/dashboard', authMiddleware, attendance.getAttendanceDashboard);
router.get('/attendance/calendar', authMiddleware, attendance.getAttendanceCalendar);
router.get('/attendance/class-summary', authMiddleware, attendance.getClassWiseSummary);
router.get('/attendance/section-summary', authMiddleware, attendance.getSectionWiseSummary);

// Student History & Low Attendance
router.get('/attendance/student/:studentId/history', authMiddleware, attendance.getStudentHistory);
router.get('/attendance/low-attendance', authMiddleware, attendance.getLowAttendanceList);

// Teacher Attendance
router.get('/attendance/teacher', authMiddleware, attendance.getTeacherAttendance);
router.post('/attendance/teacher', authMiddleware, attendance.markTeacherAttendance);
router.post('/attendance/staff/clock-in', authMiddleware, attendance.clockInStaff);

// Reports
router.get('/attendance/reports/monthly', authMiddleware, attendance.getMonthlyReport);

// Corrections (Teacher → Admin approval flow)
router.get('/attendance/corrections', authMiddleware, attendance.getCorrectionRequests);
router.post('/attendance/corrections', authMiddleware, attendance.submitCorrectionRequest);
router.patch('/attendance/corrections/:id', authMiddleware, attendance.approveCorrectionRequest);

// Legacy compatibility routes (kept working)
router.post('/attendance/bulk', authMiddleware, studentAndFee.markBulkAttendance);
router.get('/attendance/analytics', authMiddleware, studentAndFee.getAttendanceAnalytics);
router.get('/attendance/students', authMiddleware, academicAndOp.getStudentAttendance);
router.post('/attendance/students', authMiddleware, academicAndOp.markStudentAttendance);

// Admin full attendance CRUD (legacy + new)
router.get('/admin/attendance/students', authMiddleware, attendance.getStudentAttendance);
router.post('/admin/attendance/students', authMiddleware, attendance.markStudentAttendance);
router.get('/admin/attendance/staff', authMiddleware, admin.getStaffAttendance);
router.post('/admin/attendance/staff', authMiddleware, admin.markStaffAttendance);
router.patch('/admin/attendance/staff/:id/correction', authMiddleware, admin.approveStaffAttendanceCorrection);

// ─────────────────────────────────────────────────────────────────────────────
// 10. EXAMS, MARKS & REPORT CARDS
// ─────────────────────────────────────────────────────────────────────────────
// Legacy
router.post('/timetable/generate-ai', authMiddleware, academicAndOp.generateAITimetable);
router.get('/exams', authMiddleware, academicAndOp.getExams);
router.get('/marks', authMiddleware, academicAndOp.getStudentMarks);

// Admin full exam/marks CRUD
router.get('/admin/exams', authMiddleware, admin.getExams);
router.post('/admin/exams', authMiddleware, admin.createExam);
router.put('/admin/exams/:id', authMiddleware, admin.updateExam);
router.delete('/admin/exams/:id', authMiddleware, admin.deleteExam);
router.patch('/admin/exams/:id/publish', authMiddleware, admin.publishExam);

router.get('/admin/marks', authMiddleware, admin.getMarks);
router.post('/admin/marks', authMiddleware, admin.createMark);
router.put('/admin/marks/:id', authMiddleware, admin.updateMark);
router.delete('/admin/marks/:id', authMiddleware, admin.deleteMark);
router.post('/admin/marks/publish', authMiddleware, admin.publishMarks);
router.post('/admin/marks/approve', authMiddleware, admin.approveMarkWorkflow);

// Timetable (Publicly readable for Parents & Students)
router.get('/timetable', admin.getTimetable);
router.get('/admin/timetable', authMiddleware, admin.getTimetable);
router.post('/admin/timetable', authMiddleware, admin.saveTimetable);

// ─────────────────────────────────────────────────────────────────────────────
// 11. HOMEWORK & LMS
// ─────────────────────────────────────────────────────────────────────────────
// Legacy
router.get('/homework', authMiddleware, academicAndOp.getHomework);
router.post('/homework/:id/submit', authMiddleware, academicAndOp.submitHomework);
router.get('/lms', authMiddleware, academicAndOp.getLMSContent);

// Admin full CRUD
router.get('/admin/homework', authMiddleware, admin.getHomework);
router.post('/admin/homework', authMiddleware, admin.createHomework);
router.put('/admin/homework/:id', authMiddleware, admin.updateHomework);
router.patch('/admin/homework/:id/verify', authMiddleware, admin.verifyHomeworkSubmission);
router.delete('/admin/homework/:id', authMiddleware, admin.deleteHomework);

router.get('/admin/lms', authMiddleware, admin.getLMSContent);
router.post('/admin/lms', authMiddleware, admin.createLMSContent);
router.put('/admin/lms/:id', authMiddleware, admin.updateLMSContent);
router.delete('/admin/lms/:id', authMiddleware, admin.deleteLMSContent);

// ─────────────────────────────────────────────────────────────────────────────
// 12. LEAVE TYPES & REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/leave-types', authMiddleware, admin.getLeaveTypes);
router.post('/admin/leave-types', authMiddleware, admin.createLeaveType);
router.put('/admin/leave-types/:id', authMiddleware, admin.updateLeaveType);
router.delete('/admin/leave-types/:id', authMiddleware, admin.deleteLeaveType);

router.get('/admin/leave-requests', authMiddleware, admin.getLeaveRequests);
router.post('/admin/leave-requests', authMiddleware, admin.createLeaveRequest);
router.patch('/admin/leave-requests/:id/status', authMiddleware, admin.approveLeaveRequest);
router.delete('/admin/leave-requests/:id', authMiddleware, admin.deleteLeaveRequest);

// ─────────────────────────────────────────────────────────────────────────────
// 13. PAYROLL
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/payroll', authMiddleware, admin.getPayroll);
router.post('/admin/payroll/generate', authMiddleware, admin.generatePayroll);
router.put('/admin/payroll/:id', authMiddleware, admin.updatePayroll);
router.post('/admin/payroll/approve', authMiddleware, admin.approvePayroll);

// ─────────────────────────────────────────────────────────────────────────────
// 14. LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/library/books', authMiddleware, admin.getLibraryBooks);
router.post('/admin/library/books', authMiddleware, admin.createLibraryBook);
router.put('/admin/library/books/:id', authMiddleware, admin.updateLibraryBook);
router.delete('/admin/library/books/:id', authMiddleware, admin.deleteLibraryBook);

router.get('/admin/library/transactions', authMiddleware, admin.getLibraryTransactions);
router.post('/admin/library/issue', authMiddleware, admin.issueBook);
router.patch('/admin/library/return/:id', authMiddleware, admin.returnBook);

// ─────────────────────────────────────────────────────────────────────────────
// 15. TRANSPORT
// ─────────────────────────────────────────────────────────────────────────────
// Legacy
router.get('/transport', authMiddleware, academicAndOp.getTransportInfo);

// Admin full CRUD
router.get('/admin/transport', authMiddleware, admin.getTransport);
router.post('/admin/transport', authMiddleware, admin.createTransport);
router.put('/admin/transport/:id', authMiddleware, admin.updateTransport);
router.delete('/admin/transport/:id', authMiddleware, admin.deleteTransport);
router.post('/admin/transport/:id/assign-student', authMiddleware, admin.assignStudentToTransport);
router.post('/admin/transport/:id/remove-student', authMiddleware, admin.removeStudentFromTransport);

// ─────────────────────────────────────────────────────────────────────────────
// 16. HOSTEL
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/hostel/rooms', authMiddleware, admin.getHostelRooms);
router.post('/admin/hostel/rooms', authMiddleware, admin.createHostelRoom);
router.put('/admin/hostel/rooms/:id', authMiddleware, admin.updateHostelRoom);
router.delete('/admin/hostel/rooms/:id', authMiddleware, admin.deleteHostelRoom);

router.get('/admin/hostel/allocations', authMiddleware, admin.getHostelAllocations);
router.post('/admin/hostel/allocations', authMiddleware, admin.createHostelAllocation);
router.patch('/admin/hostel/allocations/:id/vacate', authMiddleware, admin.vacateHostelAllocation);

// ─────────────────────────────────────────────────────────────────────────────
// 17. INVENTORY
// ─────────────────────────────────────────────────────────────────────────────
// Legacy
router.get('/inventory', authMiddleware, academicAndOp.getInventoryItems);

// Admin full CRUD
router.get('/admin/inventory', authMiddleware, admin.getInventory);
router.post('/admin/inventory', authMiddleware, admin.createInventoryItem);
router.put('/admin/inventory/:id', authMiddleware, admin.updateInventoryItem);
router.delete('/admin/inventory/:id', authMiddleware, admin.deleteInventoryItem);

// ─────────────────────────────────────────────────────────────────────────────
// 18. HEALTH RECORDS & DISCIPLINE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/health-records', authMiddleware, admin.getHealthRecords);
router.post('/admin/health-records', authMiddleware, admin.createHealthRecord);
router.put('/admin/health-records/:id', authMiddleware, admin.updateHealthRecord);
router.delete('/admin/health-records/:id', authMiddleware, admin.deleteHealthRecord);

router.get('/admin/discipline', authMiddleware, admin.getDisciplineRecords);
router.post('/admin/discipline', authMiddleware, admin.createDisciplineRecord);
router.put('/admin/discipline/:id', authMiddleware, admin.updateDisciplineRecord);
router.delete('/admin/discipline/:id', authMiddleware, admin.deleteDisciplineRecord);

// ─────────────────────────────────────────────────────────────────────────────
// 19. COMMUNICATION — ANNOUNCEMENTS, EVENTS, VISITORS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/announcements', authMiddleware, admin.getAnnouncements);
router.post('/admin/announcements', authMiddleware, admin.createAnnouncement);
router.put('/admin/announcements/:id', authMiddleware, admin.updateAnnouncement);
router.delete('/admin/announcements/:id', authMiddleware, admin.deleteAnnouncement);

router.get('/admin/events', authMiddleware, admin.getEvents);
router.post('/admin/events', authMiddleware, admin.createEvent);
router.put('/admin/events/:id', authMiddleware, admin.updateEvent);
router.delete('/admin/events/:id', authMiddleware, admin.deleteEvent);

router.get('/admin/visitors', authMiddleware, admin.getVisitors);
router.post('/admin/visitors', authMiddleware, admin.createVisitor);
router.patch('/admin/visitors/:id/checkout', authMiddleware, admin.checkoutVisitor);
router.delete('/admin/visitors/:id', authMiddleware, admin.deleteVisitor);

// ─────────────────────────────────────────────────────────────────────────────
// 20. HELPDESK & CERTIFICATES
// ─────────────────────────────────────────────────────────────────────────────
// Legacy
router.get('/certificates', authMiddleware, academicAndOp.getCertificates);
router.post('/certificates/issue', authMiddleware, academicAndOp.issueCertificate);
router.get('/helpdesk', authMiddleware, academicAndOp.getHelpdeskTickets);

// Admin full CRUD
router.get('/admin/helpdesk', authMiddleware, admin.getHelpdesk);
router.post('/admin/helpdesk', authMiddleware, admin.createHelpdeskTicket);
router.put('/admin/helpdesk/:id', authMiddleware, admin.updateHelpdeskTicket);
router.delete('/admin/helpdesk/:id', authMiddleware, admin.deleteHelpdeskTicket);

router.get('/admin/certificates', authMiddleware, admin.getCertificates);
router.post('/admin/certificates', authMiddleware, admin.createCertificate);
router.put('/admin/certificates/:id', authMiddleware, admin.updateCertificate);
router.delete('/admin/certificates/:id', authMiddleware, admin.deleteCertificate);

// ─────────────────────────────────────────────────────────────────────────────
// 21. REPORTS, ANALYTICS & AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/reports', authMiddleware, admin.getReportsDashboard);
router.get('/admin/audit-logs', authMiddleware, admin.getAuditLogs);

// ─────────────────────────────────────────────────────────────────────────────
// 22. AI ENGINE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ai/early-warning', authMiddleware, ai.getEarlyWarningAlerts);
router.post('/ai/chat', authMiddleware, ai.askAIAssistant);

module.exports = router;

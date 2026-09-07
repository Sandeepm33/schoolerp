const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AI-Powered Mobile-First School Operating System API',
    version: '1.0.0',
    description: 'Comprehensive, interactive OpenAPI 3.0 specification for the School ERP backend system. Supports JWT authentication, real-time sync, multi-tenancy SaaS management, dynamic attendance engine, AI assistant, staff HRMS, payroll, fees, LMS, exams, hosteling, transport, and complete administration tools.',
    contact: {
      name: 'School ERP Platform Engineering',
      email: 'support@schoolerp.com'
    }
  },
  servers: [
    {
      url: 'http://127.0.0.1:5000',
      description: 'Local Express Server'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    { name: 'Auth & User Management', description: 'Authentication, current user profile, theme preferences, and user accounts' },
    { name: 'SaaS Super Admin', description: 'Multi-tenant school onboarding, subscription plans, platform stats, feature flags, and global users' },
    { name: 'Dynamic Notifications', description: 'Real-time user and system notification management' },
    { name: 'Admissions', description: 'Online admissions pipeline and application processing' },
    { name: 'Students & Enrollment', description: 'Student directory, roll allocation, bulk enrollment, and student promotion' },
    { name: 'Fees & Finance', description: 'Fee structures, categories, student fee accounts, and manual payment processing' },
    { name: 'Academic Setup', description: 'Academic years, classes, sections, and subjects management' },
    { name: 'Departments & Designations', description: 'Staff organizational hierarchy and designation tiers' },
    { name: 'Employees (HRMS)', description: 'Staff directory, HR records, qualifications, and bank accounts' },
    { name: 'Attendance System', description: 'Lockable daily/period attendance sessions, correction requests, GPS clock-in, and monthly analytics' },
    { name: 'Exams, Marks & Timetable', description: 'Exam creation, mark entry, approval workflow, report cards, and AI timetable generation' },
    { name: 'Homework & LMS', description: 'Homework assignments, student submissions, and digital LMS courseware' },
    { name: 'Leave Management', description: 'Staff & student leave policy setup and leave request approvals' },
    { name: 'Payroll Engine', description: 'Payroll generation, allowances, deductions, and salary disbursement approval' },
    { name: 'Library System', description: 'Book cataloging, issue/return transactions, overdue tracking, and fine calculation' },
    { name: 'Transport System', description: 'Route planning, vehicle tracking, student route allocation, and stop pricing' },
    { name: 'Hostel System', description: 'Hostel room management, occupancy tracking, and bed allocation' },
    { name: 'Inventory & Assets', description: 'Stock tracking, reorder thresholds, vendor pricing, and asset management' },
    { name: 'Health & Discipline', description: 'Student health profiles, medical logs, and incident tracking' },
    { name: 'Communication & Holidays', description: 'School announcements, campus events, visitor logs, and holiday calendar presets' },
    { name: 'Helpdesk & Certificates', description: 'Support ticketing, complaint resolution, and official certificate generation' },
    { name: 'Reports & Audit Logs', description: 'Executive report dashboards and audit activity tracking' },
    { name: 'AI Engine', description: 'AI assistant chat and early warning risk alert detection' },
    { name: 'Real-Time Sync', description: 'Server-Sent Events (SSE) live data mutation sync streams' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from `/api/auth/login`.'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized access / Invalid credentials' },
          error: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          schoolId: { type: 'string', nullable: true },
          schoolName: { type: 'string', example: 'Greenwood High School' },
          name: { type: 'string', example: 'Sarah Connor' },
          email: { type: 'string', example: 'sarah@school.com' },
          role: { 
            type: 'string', 
            enum: ['SAAS_SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'HEAD_MASTER', 'ACCOUNTANT', 'TEACHER', 'PARENT', 'STUDENT', 'DRIVER', 'SECURITY'],
            example: 'SCHOOL_ADMIN'
          },
          phone: { type: 'string', example: '+1234567890' },
          designation: { type: 'string', example: 'Principal' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
          mappedStudentId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      School: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'St. Xavier International School' },
          code: { type: 'string', example: 'STX001' },
          email: { type: 'string', example: 'admin@stxavier.edu' },
          phone: { type: 'string', example: '+919876543210' },
          address: { type: 'string', example: '123 Academic Way, New Delhi' },
          subscriptionPlan: { type: 'string', example: 'PREMIUM' },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'], example: 'ACTIVE' },
          logo: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          admissionNo: { type: 'string', example: 'ADM-2026-001' },
          rollNo: { type: 'string', example: '101' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
          classId: { type: 'string', example: 'Class 10' },
          sectionId: { type: 'string', example: 'Section A' },
          parentName: { type: 'string', example: 'Robert Doe' },
          parentPhone: { type: 'string', example: '+919800011122' },
          parentEmail: { type: 'string', example: 'robert.doe@example.com' },
          attendancePercentage: { type: 'number', example: 94.5 },
          totalPresent: { type: 'number', example: 189 },
          totalClasses: { type: 'number', example: 200 }
        }
      },
      AttendanceSession: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          date: { type: 'string', example: '2026-09-07' },
          classId: { type: 'string', example: 'Class 10' },
          sectionId: { type: 'string', example: 'Section A' },
          type: { type: 'string', enum: ['DAILY', 'PERIOD'], example: 'DAILY' },
          status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'LOCKED'], example: 'SUBMITTED' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                studentId: { type: 'string' },
                studentName: { type: 'string' },
                rollNo: { type: 'string' },
                status: { type: 'string', enum: ['P', 'A', 'L', 'HD', 'LV', 'OD', 'H', 'W', 'NM'], example: 'P' },
                remarks: { type: 'string' }
              }
            }
          },
          summary: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 35 },
              present: { type: 'number', example: 32 },
              absent: { type: 'number', example: 3 }
            }
          }
        }
      },
      Admission: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          applicationNo: { type: 'string', example: 'APP-2026-884' },
          applicantName: { type: 'string', example: 'Alice Smith' },
          parentName: { type: 'string', example: 'David Smith' },
          phone: { type: 'string', example: '+919876543210' },
          email: { type: 'string', example: 'david@smith.com' },
          targetClass: { type: 'string', example: 'Grade 1' },
          status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'PENDING', 'UNDER_VERIFICATION', 'DOCUMENTS_PENDING', 'SELECTED', 'ACCEPTED', 'APPROVED', 'REJECTED', 'CONFIRMED'], example: 'SUBMITTED' }
        }
      },
      FeeStructure: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Annual Fee 2026-2027 - Class 10' },
          academicYear: { type: 'string', example: '2026-2027' },
          targetClass: { type: 'string', example: 'Class 10' },
          tuitionFee: { type: 'number', example: 45000 },
          developmentFee: { type: 'number', example: 5000 },
          examFee: { type: 'number', example: 2000 },
          totalAmount: { type: 'number', example: 52000 }
        }
      },
      StudentFee: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          studentId: { type: 'string' },
          academicYear: { type: 'string', example: '2026-2027' },
          totalDue: { type: 'number', example: 52000 },
          amountPaid: { type: 'number', example: 26000 },
          balance: { type: 'number', example: 26000 },
          status: { type: 'string', enum: ['PAID', 'PARTIAL', 'OVERDUE', 'UNPAID'], example: 'PARTIAL' }
        }
      },
      Exam: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Mid-Term Examination 2026' },
          examType: { type: 'string', example: 'Mid-Term' },
          targetClass: { type: 'string', example: 'Class 10' },
          subjects: { type: 'array', items: { type: 'string' }, example: ['Mathematics', 'Science', 'English'] },
          totalMarks: { type: 'number', example: 100 },
          passingMarks: { type: 'number', example: 35 },
          isPublished: { type: 'boolean', example: true }
        }
      },
      Mark: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          examId: { type: 'string' },
          studentId: { type: 'string' },
          studentName: { type: 'string', example: 'John Doe' },
          rollNo: { type: 'string', example: '101' },
          subjectName: { type: 'string', example: 'Mathematics' },
          subjectMarks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                subject: { type: 'string', example: 'Mathematics' },
                marksObtained: { type: 'number', example: 88 },
                maxMarks: { type: 'number', example: 100 },
                grade: { type: 'string', example: 'A+' }
              }
            }
          },
          totalMarksObtained: { type: 'number', example: 88 },
          percentage: { type: 'number', example: 88.0 },
          approvalStatus: { type: 'string', example: 'PUBLISHED' }
        }
      },
      Homework: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Algebra Worksheet Chapter 4' },
          classId: { type: 'string', example: 'Class 10' },
          subject: { type: 'string', example: 'Mathematics' },
          teacherName: { type: 'string', example: 'Prof. Alan Turing' },
          dueDate: { type: 'string', format: 'date' },
          description: { type: 'string', example: 'Complete problems 1 through 15 on quadratic equations.' }
        }
      },
      LMSContent: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Physics Mechanics Video Lecture' },
          classId: { type: 'string', example: 'Class 10' },
          subject: { type: 'string', example: 'Physics' },
          contentType: { type: 'string', enum: ['PDF', 'VIDEO', 'NOTE', 'QUESTION_BANK', 'ASSIGNMENT'], example: 'VIDEO' },
          fileUrl: { type: 'string' }
        }
      },
      StaffHRMS: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          employeeId: { type: 'string', example: 'EMP-2026-042' },
          name: { type: 'string', example: 'Dr. Jane Smith' },
          email: { type: 'string', example: 'jane.smith@school.com' },
          department: { type: 'string', example: 'Science' },
          designation: { type: 'string', example: 'Senior Physics Teacher' },
          basicSalary: { type: 'number', example: 65000 },
          netSalary: { type: 'number', example: 72000 },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], example: 'ACTIVE' }
        }
      },
      Payroll: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          employeeId: { type: 'string' },
          employeeName: { type: 'string', example: 'Dr. Jane Smith' },
          month: { type: 'string', example: 'September' },
          year: { type: 'string', example: '2026' },
          basicSalary: { type: 'number', example: 65000 },
          allowances: { type: 'number', example: 10000 },
          deductions: { type: 'number', example: 3000 },
          netSalary: { type: 'number', example: 72000 },
          status: { type: 'string', enum: ['GENERATED', 'APPROVED', 'PAID', 'ON_HOLD'], example: 'APPROVED' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'New Admission Inquiry' },
          message: { type: 'string', example: 'A new admission inquiry has been submitted.' },
          type: { type: 'string', enum: ['INQUIRY', 'ADMISSION', 'FEE', 'ANNOUNCEMENT', 'SYSTEM'], example: 'INQUIRY' },
          read: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    // 1. AUTH & USER MANAGEMENT
    '/api/auth/login': {
      post: {
        tags: ['Auth & User Management'],
        summary: 'Authenticate User & Generate JWT Token',
        description: 'Authenticates a user with email and password, returning JWT access token and user profile.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@school.com' },
                  password: { type: 'string', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth & User Management'],
        summary: 'Get Current Authenticated User Profile',
        responses: {
          200: {
            description: 'Current user profile details',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/auth/profile': {
      put: {
        tags: ['Auth & User Management'],
        summary: 'Update Current User Profile Information',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                  avatar: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated successfully' }
        }
      }
    },
    '/api/auth/theme': {
      put: {
        tags: ['Auth & User Management'],
        summary: 'Update User Interface Theme Preference',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  themePreference: { type: 'object' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Theme updated' } }
      }
    },
    '/api/users': {
      get: {
        tags: ['Auth & User Management'],
        summary: 'List School Users & Roles',
        responses: {
          200: {
            description: 'Array of user accounts',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Auth & User Management'],
        summary: 'Create New User Account (Admin Only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string' },
                  phone: { type: 'string' },
                  designation: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'User account created successfully' } }
      }
    },
    '/api/users/{id}': {
      put: {
        tags: ['Auth & User Management'],
        summary: 'Update User Account Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
        },
        responses: { 200: { description: 'User updated' } }
      },
      delete: {
        tags: ['Auth & User Management'],
        summary: 'Delete User Account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User deleted' } }
      }
    },

    // 2. SAAS SUPER ADMIN ROUTES
    '/api/saas/schools': {
      get: {
        tags: ['SaaS Super Admin'],
        summary: 'Get All Registered Tenant Schools',
        responses: {
          200: {
            description: 'List of schools',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/School' } } } }
          }
        }
      },
      post: {
        tags: ['SaaS Super Admin'],
        summary: 'Onboard & Provision New Tenant School',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code', 'email'],
                properties: {
                  name: { type: 'string', example: 'Apex Academy' },
                  code: { type: 'string', example: 'APEX01' },
                  email: { type: 'string', example: 'admin@apex.com' },
                  phone: { type: 'string' },
                  subscriptionPlan: { type: 'string', example: 'PREMIUM' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'School provisioned' } }
      }
    },
    '/api/saas/schools/{id}': {
      put: {
        tags: ['SaaS Super Admin'],
        summary: 'Update School Organization Profile',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'School profile updated' } }
      },
      delete: {
        tags: ['SaaS Super Admin'],
        summary: 'Delete Tenant School & Data',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'School deleted' } }
      }
    },
    '/api/saas/schools/{id}/status': {
      patch: {
        tags: ['SaaS Super Admin'],
        summary: 'Toggle Tenant Active / Suspended Status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] } }
              }
            }
          }
        },
        responses: { 200: { description: 'Status updated' } }
      }
    },
    '/api/saas/impersonate': {
      post: {
        tags: ['SaaS Super Admin'],
        summary: 'Impersonate School Admin Account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['schoolId'],
                properties: { schoolId: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Impersonation token generated' } }
      }
    },
    '/api/saas/plans': {
      get: {
        tags: ['SaaS Super Admin'],
        summary: 'List Available SaaS Subscription Plans',
        responses: { 200: { description: 'List of subscription plans' } }
      },
      post: {
        tags: ['SaaS Super Admin'],
        summary: 'Create or Update Subscription Plan',
        responses: { 200: { description: 'Plan saved' } }
      }
    },
    '/api/saas/stats': {
      get: {
        tags: ['SaaS Super Admin'],
        summary: 'Get Global SaaS Platform Key Metrics & Stats',
        responses: { 200: { description: 'SaaS metrics summary' } }
      }
    },
    '/api/testimonials': {
      get: {
        tags: ['SaaS Super Admin'],
        summary: 'Get Public Testimonials for Landing Page',
        security: [],
        responses: { 200: { description: 'Public testimonials list' } }
      },
      post: {
        tags: ['SaaS Super Admin'],
        summary: 'Submit Public Customer Testimonial',
        security: [],
        responses: { 201: { description: 'Testimonial submitted for review' } }
      }
    },

    // 3. DYNAMIC NOTIFICATIONS
    '/api/notifications': {
      get: {
        tags: ['Dynamic Notifications'],
        summary: 'Get User Notifications',
        responses: {
          200: {
            description: 'List of notifications',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } }
          }
        }
      },
      post: {
        tags: ['Dynamic Notifications'],
        summary: 'Create & Broadcast Notification',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Notification' } } }
        },
        responses: { 201: { description: 'Notification created' } }
      }
    },
    '/api/notifications/read-all': {
      put: {
        tags: ['Dynamic Notifications'],
        summary: 'Mark All Notifications as Read',
        responses: { 200: { description: 'All notifications marked as read' } }
      }
    },
    '/api/notifications/{id}/read': {
      put: {
        tags: ['Dynamic Notifications'],
        summary: 'Mark Specific Notification as Read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Notification read' } }
      }
    },

    // 4. ADMISSIONS
    '/api/admissions': {
      get: {
        tags: ['Admissions'],
        summary: 'List Admission Applications',
        responses: {
          200: {
            description: 'List of admission applications',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Admission' } } } }
          }
        }
      },
      post: {
        tags: ['Admissions'],
        summary: 'Submit New Student Admission Application',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Admission' } } }
        },
        responses: { 201: { description: 'Application submitted successfully' } }
      }
    },
    '/api/admissions/{id}/status': {
      patch: {
        tags: ['Admissions'],
        summary: 'Update Admission Application Status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['DRAFT', 'SUBMITTED', 'PENDING', 'UNDER_VERIFICATION', 'DOCUMENTS_PENDING', 'SELECTED', 'ACCEPTED', 'APPROVED', 'REJECTED', 'CONFIRMED']
                  }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Admission status updated' } }
      }
    },

    // 5. STUDENTS
    '/api/students': {
      get: {
        tags: ['Students & Enrollment'],
        summary: 'Get Students List',
        responses: {
          200: {
            description: 'Array of student records',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } }
          }
        }
      },
      post: {
        tags: ['Students & Enrollment'],
        summary: 'Create Student Record',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } }
        },
        responses: { 201: { description: 'Student created' } }
      }
    },
    '/api/students/{id}': {
      get: {
        tags: ['Students & Enrollment'],
        summary: 'Get Student Profile Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } } }
      }
    },
    '/api/admin/students/enroll': {
      post: {
        tags: ['Students & Enrollment'],
        summary: 'Enroll Student & Provision Parent/Student Login Accounts',
        responses: { 201: { description: 'Student enrolled and login accounts generated' } }
      }
    },
    '/api/admin/students/bulk-enroll': {
      post: {
        tags: ['Students & Enrollment'],
        summary: 'Bulk Enroll Students via Excel / CSV Upload',
        responses: { 200: { description: 'Bulk enrollment completed' } }
      }
    },

    // 6. FEES & FINANCE
    '/api/fees/structures': {
      get: {
        tags: ['Fees & Finance'],
        summary: 'Get Fee Structures (Strict Parent Access Guarded)',
        responses: { 200: { description: 'Fee structures list' } }
      }
    },
    '/api/fees/student-fees': {
      get: {
        tags: ['Fees & Finance'],
        summary: 'Get Student Fee Accounts & Balances',
        responses: { 200: { description: 'Student fee accounts' } }
      }
    },
    '/api/fees/pay': {
      post: {
        tags: ['Fees & Finance'],
        summary: 'Record Fee Payment Transaction',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'amount'],
                properties: {
                  studentId: { type: 'string' },
                  amount: { type: 'number', example: 5000 },
                  paymentMode: { type: 'string', enum: ['CASH', 'CHEQUE', 'ONLINE_UPI', 'BANK_TRANSFER'], example: 'ONLINE_UPI' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Payment recorded and receipt generated' } }
      }
    },

    // 7. ATTENDANCE SYSTEM
    '/api/admin/attendance/settings': {
      get: {
        tags: ['Attendance System'],
        summary: 'Get School Attendance Engine Rules & Configuration',
        responses: { 200: { description: 'Attendance settings' } }
      },
      put: {
        tags: ['Attendance System'],
        summary: 'Save Attendance Settings',
        responses: { 200: { description: 'Settings updated' } }
      }
    },
    '/api/attendance/sessions': {
      get: {
        tags: ['Attendance System'],
        summary: 'Get Attendance Sessions for Date/Class',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-09-07' } },
          { name: 'classId', in: 'query', schema: { type: 'string', example: 'Class 10' } },
          { name: 'sectionId', in: 'query', schema: { type: 'string', example: 'Section A' } }
        ],
        responses: { 200: { description: 'Attendance session data' } }
      }
    },
    '/api/attendance/sessions/draft': {
      post: {
        tags: ['Attendance System'],
        summary: 'Save Attendance Draft Session',
        responses: { 200: { description: 'Draft saved' } }
      }
    },
    '/api/attendance/sessions/submit': {
      post: {
        tags: ['Attendance System'],
        summary: 'Submit & Finalize Attendance Session (Triggers Notifications)',
        responses: { 200: { description: 'Session submitted and parent notifications sent' } }
      }
    },

    // 8. EXAMS & MARKS
    '/api/exams': {
      get: {
        tags: ['Exams, Marks & Timetable'],
        summary: 'List Scheduled Exams',
        responses: { 200: { description: 'Exams list' } }
      }
    },
    '/api/admin/exams': {
      get: { tags: ['Exams, Marks & Timetable'], summary: 'Admin Get All Exams' },
      post: { tags: ['Exams, Marks & Timetable'], summary: 'Create New Exam Schedule' }
    },
    '/api/admin/marks': {
      get: { tags: ['Exams, Marks & Timetable'], summary: 'Get Marks Directory' },
      post: { tags: ['Exams, Marks & Timetable'], summary: 'Enter Student Exam Marks' }
    },
    '/api/timetable': {
      get: {
        tags: ['Exams, Marks & Timetable'],
        summary: 'Get Class Timetable (Public / Student View)',
        security: [],
        responses: { 200: { description: 'Timetable schedule' } }
      }
    },
    '/api/timetable/generate-ai': {
      post: {
        tags: ['Exams, Marks & Timetable'],
        summary: 'Generate Automated AI Class Timetable',
        responses: { 200: { description: 'AI generated timetable successfully' } }
      }
    },

    // 9. HOMEWORK & LMS
    '/api/homework': {
      get: { tags: ['Homework & LMS'], summary: 'Get Homework Assignments' }
    },
    '/api/homework/{id}/submit': {
      post: {
        tags: ['Homework & LMS'],
        summary: 'Student Submit Homework File / Text',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Homework submitted' } }
      }
    },
    '/api/lms': {
      get: { tags: ['Homework & LMS'], summary: 'Get LMS Digital Learning Materials' }
    },

    // 10. PAYROLL & HRMS
    '/api/admin/employees': {
      get: { tags: ['Employees (HRMS)'], summary: 'List Staff Employees' },
      post: { tags: ['Employees (HRMS)'], summary: 'Add New Employee Record' }
    },
    '/api/admin/payroll': {
      get: { tags: ['Payroll Engine'], summary: 'Get Payroll Records' }
    },
    '/api/admin/payroll/generate': {
      post: { tags: ['Payroll Engine'], summary: 'Auto-Generate Monthly Payroll for Staff' }
    },

    // 11. TRANSPORT, HOSTEL, INVENTORY
    '/api/transport': {
      get: { tags: ['Transport System'], summary: 'Get Transport Route & Bus Information' }
    },
    '/api/admin/hostel/rooms': {
      get: { tags: ['Hostel System'], summary: 'Get Hostel Rooms Directory' },
      post: { tags: ['Hostel System'], summary: 'Create Hostel Room' }
    },
    '/api/inventory': {
      get: { tags: ['Inventory & Assets'], summary: 'Get Inventory Stock Items' }
    },

    // 12. AI ENGINE & REAL-TIME SYNC
    '/api/ai/early-warning': {
      get: {
        tags: ['AI Engine'],
        summary: 'Get AI Early Warning Dropout Risk Alerts',
        responses: { 200: { description: 'Risk score alerts list' } }
      }
    },
    '/api/ai/chat': {
      post: {
        tags: ['AI Engine'],
        summary: 'Interactive AI ERP Assistant Query',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: { prompt: { type: 'string', example: 'Show me total fee collections this month' } }
              }
            }
          }
        },
        responses: { 200: { description: 'AI Assistant response' } }
      }
    },
    '/api/sync/stream': {
      get: {
        tags: ['Real-Time Sync'],
        summary: 'Server-Sent Events (SSE) Live Data Sync Connection',
        responses: { 200: { description: 'EventStream connected' } }
      }
    },
    '/api/sync/check': {
      get: {
        tags: ['Real-Time Sync'],
        summary: 'Check Real-Time SSE Stream Health Status',
        responses: { 200: { description: 'SSE status online' } }
      }
    }
  }
};

module.exports = swaggerSpec;

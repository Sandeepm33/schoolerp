const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const { School, User, Student, Admission, FeeStructure, StudentFee, Attendance, StaffAttendance } = require('./models/coreModels');
const { Timetable, Exam, Mark, Homework, LMSContent, Transport, Inventory, StaffHRMS, Certificate, Helpdesk } = require('./models/extendedModels');

const removeAllSampleData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('Failed to connect to DB.');
      process.exit(1);
    }

    console.log('🧹 Purging 100% of sample data, sample schools, and sample tenant users from MongoDB Atlas...');

    // 1. Clear all operational data
    await Student.deleteMany({});
    await Admission.deleteMany({});
    await FeeStructure.deleteMany({});
    await StudentFee.deleteMany({});
    await Attendance.deleteMany({});
    await StaffAttendance.deleteMany({});
    await Timetable.deleteMany({});
    await Exam.deleteMany({});
    await Mark.deleteMany({});
    await Homework.deleteMany({});
    await LMSContent.deleteMany({});
    await Transport.deleteMany({});
    await Inventory.deleteMany({});
    await Certificate.deleteMany({});
    if (Helpdesk && Helpdesk.deleteMany) await Helpdesk.deleteMany({});

    // 2. Clear all schools
    await School.deleteMany({});

    // 3. Clear all users EXCEPT SaaS Super Admin
    await User.deleteMany({ role: { $ne: 'SAAS_SUPER_ADMIN' } });

    // 4. Ensure SaaS Super Admin user exists
    let saasAdmin = await User.findOne({ role: 'SAAS_SUPER_ADMIN' });
    if (!saasAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      saasAdmin = await User.create({
        name: 'Platform Super Admin',
        email: 'superadmin@saas.com',
        password: hashedPassword,
        role: 'SAAS_SUPER_ADMIN',
        phone: '+1 (800) 555-SAAS',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'
      });
      console.log('✅ Created SaaS Super Admin account: superadmin@saas.com');
    }

    const userCount = await User.countDocuments();
    const schoolCount = await School.countDocuments();

    console.log(`\n======================================================`);
    console.log(`✅ COMPLETE! 100% of sample data & sample schools deleted.`);
    console.log(`🔒 Active DB State: ${schoolCount} Schools | ${userCount} Master Account (superadmin@saas.com)`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error removing sample data:', error);
    process.exit(1);
  }
};

removeAllSampleData();

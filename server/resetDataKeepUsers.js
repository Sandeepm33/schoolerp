const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const { Student, Admission, FeeStructure, StudentFee, School, User } = require('./models/coreModels');
const { Timetable, Exam, Homework, LMSContent, Transport, Inventory, Certificate, Helpdesk } = require('./models/extendedModels');

const resetOperationalData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('Failed to connect to DB for cleanup.');
      process.exit(1);
    }

    console.log('🧹 Clearing operational mock data from MongoDB Atlas (Preserving Users & Schools)...');

    // Wipe operational collections
    await Student.deleteMany({});
    await Admission.deleteMany({});
    await FeeStructure.deleteMany({});
    await StudentFee.deleteMany({});
    await Timetable.deleteMany({});
    await Exam.deleteMany({});
    await Homework.deleteMany({});
    await LMSContent.deleteMany({});
    await Transport.deleteMany({});
    await Inventory.deleteMany({});
    await Certificate.deleteMany({});
    if (Helpdesk && Helpdesk.deleteMany) await Helpdesk.deleteMany({});

    const totalUsers = await User.countDocuments();
    const totalSchools = await School.countDocuments();

    console.log(`\n======================================================`);
    console.log(`✅ COMPLETE! All operational data deleted from MongoDB Atlas.`);
    console.log(`🔒 PRESERVED: ${totalUsers} User Login Accounts & ${totalSchools} School Tenants intact.`);
    console.log(`======================================================\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during data reset:', error);
    process.exit(1);
  }
};

resetOperationalData();

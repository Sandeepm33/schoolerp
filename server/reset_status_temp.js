const mongoose = require('mongoose');

async function resetMarks() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas...');

  const db = mongoose.connection.db;
  const marksCollection = db.collection('marks');

  const beforeCount = await marksCollection.countDocuments({});
  console.log('Total mark records in database:', beforeCount);

  const res = await marksCollection.updateMany(
    {},
    {
      $set: {
        approvalStatus: 'SUBMITTED_BY_TEACHER',
        isPublished: false
      },
      $unset: {
        principalApproval: '',
        headmasterApproval: ''
      }
    }
  );

  console.log('Reset result:', res);
  console.log('All mark records successfully updated to SUBMITTED_BY_TEACHER (isPublished: false).');

  await mongoose.disconnect();
}

resetMarks().catch(console.error);

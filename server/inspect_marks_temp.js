const mongoose = require('mongoose');

async function inspectMarks() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas...');

  const db = mongoose.connection.db;
  const marksCollection = db.collection('marks');

  const docs = await marksCollection.find({}).toArray();
  console.log('Total mark records in database:', docs.length);
  docs.forEach((d, i) => {
    console.log(`[${i + 1}] Class: ${d.classId}, Exam: ${d.examTitle}, Subject: ${d.subjectName}, Status: ${d.approvalStatus}, Published: ${d.isPublished}`);
  });

  await mongoose.disconnect();
}

inspectMarks().catch(console.error);

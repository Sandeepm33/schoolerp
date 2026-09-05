const mongoose = require('mongoose');

async function deleteAllMarks() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas...');

  const db = mongoose.connection.db;
  const marksCollection = db.collection('marks');

  const beforeCount = await marksCollection.countDocuments({});
  console.log('Total mark records before deletion:', beforeCount);

  const res = await marksCollection.deleteMany({});
  console.log('Deletion result:', res);

  const afterCount = await marksCollection.countDocuments({});
  console.log('Total mark records after deletion:', afterCount);

  console.log('All mark records have been successfully deleted from MongoDB Atlas.');

  await mongoose.disconnect();
}

deleteAllMarks().catch(console.error);

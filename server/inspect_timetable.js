const mongoose = require('mongoose');

async function inspect() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS');
  const docs = await mongoose.connection.db.collection('timetables').find({}).toArray();
  console.log('TOTAL TIMETABLE DOCS:', docs.length);
  console.log(JSON.stringify(docs, null, 2));
  await mongoose.disconnect();
}

inspect().catch(console.error);

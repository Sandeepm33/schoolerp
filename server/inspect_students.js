const mongoose = require('mongoose');

async function inspect() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS');

  const { Student, User } = require('./models/coreModels');

  const students = await Student.find({}).toArray ? await Student.find({}).toArray() : await mongoose.connection.db.collection('students').find({}).toArray();
  console.log('TOTAL STUDENTS IN ATLAS:', students.length);
  console.log(JSON.stringify(students, null, 2));

  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('TOTAL USERS IN ATLAS:', users.length);
  console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, classId: u.classId, sectionId: u.sectionId, mappedStudentId: u.mappedStudentId })), null, 2));

  await mongoose.disconnect();
}

inspect().catch(console.error);

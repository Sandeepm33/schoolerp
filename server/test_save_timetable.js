const mongoose = require('mongoose');

async function testSave() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS');

  const { Timetable } = require('./models/extendedModels');

  const cleanCls = 'LKG';
  const cleanSec = 'A';

  await Timetable.deleteMany({
    classId: { $regex: new RegExp(`^${cleanCls}$`, 'i') },
    sectionId: { $regex: new RegExp(`^${cleanSec}$`, 'i') }
  });

  const doc = await Timetable.create({
    classId: cleanCls,
    sectionId: cleanSec,
    academicYear: '2026-2027',
    periods: [
      { periodNo: 1, name: 'Period 1', startTime: '09:30 AM', endTime: '09:45 AM', isBreak: false },
      { periodNo: 2, name: 'Period 2', startTime: '09:45 AM', endTime: '10:30 AM', isBreak: false },
      { periodNo: 3, name: 'Tea / Recess Break', startTime: '10:30 AM', endTime: '10:45 AM', isBreak: true },
      { periodNo: 4, name: 'Period 4', startTime: '10:45 AM', endTime: '11:30 AM', isBreak: false }
    ],
    schedule: [
      { day: 'Monday', periodNo: 1, periodName: 'Period 1', startTime: '09:30 AM', endTime: '09:45 AM', subject: 'TELUGU', teacherName: 'Raju Sir', roomNo: 'Room A-101' },
      { day: 'Monday', periodNo: 2, periodName: 'Period 2', startTime: '09:45 AM', endTime: '10:30 AM', subject: 'English', teacherName: 'Vijay', roomNo: 'Room A-102' },
      { day: 'Monday', periodNo: 4, periodName: 'Period 4', startTime: '10:45 AM', endTime: '11:30 AM', subject: 'Maths', teacherName: 'Raju Sir', roomNo: 'Room A-103' }
    ]
  });

  console.log('SUCCESSFULLY SAVED DOC TO ATLAS:');
  console.log(JSON.stringify(doc, null, 2));

  await mongoose.disconnect();
}

testSave().catch(console.error);

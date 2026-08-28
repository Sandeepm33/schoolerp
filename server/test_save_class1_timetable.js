const mongoose = require('mongoose');

async function testSave() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS');

  const { Timetable } = require('./models/extendedModels');

  const cleanCls = '1';
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
      { periodNo: 1, name: 'Period 1', startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false },
      { periodNo: 2, name: 'Period 2', startTime: '10:15 AM', endTime: '11:00 AM', isBreak: false },
      { periodNo: 3, name: 'Tea / Recess Break', startTime: '11:00 AM', endTime: '11:15 AM', isBreak: true },
      { periodNo: 4, name: 'Period 4', startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false }
    ],
    schedule: [
      { day: 'Monday', periodNo: 1, periodName: 'Period 1', startTime: '09:30 AM', endTime: '10:15 AM', subject: 'Mathematics', teacherName: 'Dr. Sarah Jenkins', roomNo: 'Room 101' },
      { day: 'Monday', periodNo: 2, periodName: 'Period 2', startTime: '10:15 AM', endTime: '11:00 AM', subject: 'Science', teacherName: 'Mr. Robert Vance', roomNo: 'Room 102' },
      { day: 'Monday', periodNo: 4, periodName: 'Period 4', startTime: '11:15 AM', endTime: '12:00 PM', subject: 'Computer Science', teacherName: 'Ms. Anita Sharma', roomNo: 'Lab 1' }
    ]
  });

  console.log('SUCCESSFULLY SAVED CLASS 1 TIMETABLE TO ATLAS:');
  console.log(JSON.stringify(doc, null, 2));

  await mongoose.disconnect();
}

testSave().catch(console.error);

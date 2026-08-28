const mongoose = require('mongoose');

async function clean() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS FOR CLEANUP');

  // 1. Remove any test schedule items containing "Robert", "Sarah", "Anita" from all Timetable docs
  const timetables = await mongoose.connection.db.collection('timetables').find({}).toArray();
  for (const tt of timetables) {
    if (tt.schedule && Array.isArray(tt.schedule)) {
      const updatedSchedule = tt.schedule.map(item => {
        if (item.teacherName && (item.teacherName.includes('Robert') || item.teacherName.includes('Sarah') || item.teacherName.includes('Anita'))) {
          return { ...item, teacherName: '', subject: item.subject === 'Science' || item.subject === 'Computer Science' ? '' : item.subject };
        }
        return item;
      });
      await mongoose.connection.db.collection('timetables').updateOne(
        { _id: tt._id },
        { $set: { schedule: updatedSchedule } }
      );
    }
  }

  // 2. Delete any Users / StaffHRMS matching test names
  await mongoose.connection.db.collection('users').deleteMany({
    name: { $regex: /(Robert|Sarah|Anita|Vance|Jenkins)/i }
  });

  await mongoose.connection.db.collection('staffhrms').deleteMany({
    $or: [
      { name: { $regex: /(Robert|Sarah|Anita|Vance|Jenkins)/i } },
      { firstName: { $regex: /(Robert|Sarah|Anita|Vance|Jenkins)/i } }
    ]
  });

  console.log('CLEANUP COMPLETE: Removed all test employee data ("Mr. Robert Vance", "Dr. Sarah Jenkins", etc.) from Atlas!');
  await mongoose.disconnect();
}

clean().catch(console.error);

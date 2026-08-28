const mongoose = require('mongoose');

async function cleanDuplicates() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('CONNECTED TO ATLAS FOR ATTENDANCE DEDUPING');

  const db = mongoose.connection.db;
  const records = await db.collection('attendancerecords').find({}).toArray();

  console.log('TOTAL RAW ATTENDANCE RECORDS IN ATLAS:', records.length);

  // Group by studentId + date YYYY-MM-DD
  const seenMap = new Map();
  const toDelete = [];

  for (const r of records) {
    const stId = String(r.studentId);
    const d = new Date(r.date || r.createdAt || Date.now());
    const dateStr = d.toISOString().split('T')[0];
    const key = `${stId}_${dateStr}`;

    if (seenMap.has(key)) {
      // Keep newest record, delete older duplicate
      const existing = seenMap.get(key);
      if (new Date(r.updatedAt || r.createdAt || 0) > new Date(existing.updatedAt || existing.createdAt || 0)) {
        toDelete.push(existing._id);
        seenMap.set(key, r);
      } else {
        toDelete.push(r._id);
      }
    } else {
      seenMap.set(key, r);
    }
  }

  if (toDelete.length > 0) {
    await db.collection('attendancerecords').deleteMany({ _id: { $in: toDelete } });
    console.log(`REMOVED ${toDelete.length} DUPLICATE ATTENDANCE RECORDS FROM ATLAS!`);
  }

  // Update remaining records to ensure dateStr is set
  for (const [key, r] of seenMap.entries()) {
    const d = new Date(r.date || r.createdAt || Date.now());
    const dateStr = d.toISOString().split('T')[0];
    await db.collection('attendancerecords').updateOne(
      { _id: r._id },
      { $set: { dateStr, studentIdStr: String(r.studentId) } }
    );
  }

  console.log('DEDUPING & DATESTR MIGRATION COMPLETE!');
  await mongoose.disconnect();
}

cleanDuplicates().catch(console.error);

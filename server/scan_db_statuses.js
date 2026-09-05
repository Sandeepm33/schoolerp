const mongoose = require('mongoose');

async function scanDB() {
  const uri = 'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas...');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  for (const col of collections) {
    const colName = col.name;
    const countAll = await db.collection(colName).countDocuments({});
    if (countAll === 0) continue;

    const approvedDocs = await db.collection(colName).find({
      $or: [
        { status: { $regex: /APPROVED|PUBLISHED/i } },
        { approvalStatus: { $regex: /APPROVED|PUBLISHED/i } },
        { isPublished: true }
      ]
    }).toArray();

    if (approvedDocs.length > 0) {
      console.log(`\nCollection [${colName}]: ${approvedDocs.length} approved/published doc(s) out of ${countAll} total:`);
      approvedDocs.forEach((d, i) => {
        console.log(`  - id: ${d._id}, status: ${d.status}, approvalStatus: ${d.approvalStatus}, isPublished: ${d.isPublished}, title/name: ${d.title || d.name || d.studentName || d.className}`);
      });
    }
  }

  await mongoose.disconnect();
}

scanDB().catch(console.error);

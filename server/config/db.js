const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasURI = process.env.MONGODB_URI || 
    'mongodb+srv://erpschool286_db_user:di9DRNvNLPaI9Gl5@schoolerp.gwypf7m.mongodb.net/school_erp?retryWrites=true&w=majority&appName=schoolerp';

  console.log('🌐 Connecting STRICTLY to MongoDB Atlas Cluster (schoolerp.gwypf7m.mongodb.net)...');

  try {
    const conn = await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`\n======================================================`);
    console.log(`✅ LIVE ATLAS CONNECTED! Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`======================================================\n`);
    return conn;
  } catch (err) {
    console.error('\n❌ MONGODB ATLAS CONNECTION ERROR:', err.message);
    console.error('⚠️ NOTE: If connection timed out, please ensure Network Access in MongoDB Atlas allows 0.0.0.0/0 (Access from Anywhere).\n');
    throw err;
  }
};

module.exports = connectDB;

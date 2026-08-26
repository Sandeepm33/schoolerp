const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const seedData = require('./seed');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Powered Mobile-First School ERP Backend',
    database: 'MongoDB Mongoose Persistent Engine',
    credentials: {
      dbUser: process.env.DB_USER || 'erpschool286_db_user'
    },
    parentPolicy: 'STRICT ZERO FEE ACCESS ENFORCED'
  });
});

const PORT = process.env.PORT || 5000;

// Start Server listening on 0.0.0.0 (all network interfaces)
const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedData();
    }
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 School ERP Express Server running on http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 School ERP Express Server running on http://127.0.0.1:${PORT}`);
    });
  }
};

startServer();

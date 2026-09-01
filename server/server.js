const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Reloaded Mongoose Schemas & Controllers (Leadership Role Creation Enforced: Only Primary Admin Can Create Leadership Roles)
dotenv.config();








const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const seedData = require('./seed');
const { handleSyncStream, handleSyncCheck, broadcastDataMutation } = require('./config/dataSync');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Real-Time Server-Sent Events (SSE) Sync Stream Route
app.get('/api/sync/stream', handleSyncStream);
app.get('/api/sync/check', handleSyncCheck);

// Automatic Mutation Interceptor Middleware (Broadcasts live events to ALL connected users across ALL devices)
app.use((req, res, next) => {
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parts = req.path.split('/').filter(Boolean);
          const entity = (parts[1] || parts[0] || 'ALL').toUpperCase();
          broadcastDataMutation({ entity, action: method, payload: body });
        } catch (err) {}
      }
      return originalJson.apply(this, arguments);
    };
  }
  next();
});

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

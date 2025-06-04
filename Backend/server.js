const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
    
// // MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigin = ['http://localhost:5173'];

// Middleware
app.use(cors({
  origin: allowedOrigin ,  // Allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true  
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully 🚀'))
    .catch(error => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
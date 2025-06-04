require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/UnSquare';
const allowedOrigin = ['http://localhost:5173'];

// Middleware
app.use(cors({
  origin: allowedOrigin,
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

// User Schema
const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true, trim: true },
  position: String,
  department: String,
  phone: String,
  address: String,
  joinDate: Date,
  leavingDate: Date,
  password: String,
  role: { type: String, default: 'employee' }
});

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to verify JWT token (for protected routes)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  // Bypass verification for admin-token
  if (token === 'admin-token') {
    req.user = { userId: 'admin-id', role: 'admin' }; // Mock user data for admin
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add New Employee
app.post('/api/employees', verifyToken, async (req, res) => {
  try {
    const userData = req.body;
    userData.role = userData.role || 'employee';
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Employee by ID
app.get('/api/employees/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const trimmedEmail = email.trim();

    const user = await User.findOne({ email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } });
    console.log('Login attempt:', {
      email: trimmedEmail,
      password,
      storedPassword: user?.password,
      userId: user?._id,
      role: user?.role
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (password !== user.password) {
      console.log('Password mismatch:', { provided: password, stored: user.password });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      token: token
    });

    res.json({
      token,
      user: {
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        phone: user.phone,
        address: user.address,
        joinDate: user.joinDate,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile Route (to fetch logged-in user details)
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
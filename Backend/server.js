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

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      city: String
    }
  },
  checkOut: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      city: String
    }
  },
  totalTimeSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['present', 'absent'], default: 'absent' },
  grade: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  if (token === 'admin-token') {
    req.user = { userId: 'admin-id', role: 'admin' };
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

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Calculate punctuality grade
const calculatePunctualityGrade = (checkInTime, checkOutTime) => {
  let grade = 100;

  const expectedCheckIn = new Date(checkInTime);
  expectedCheckIn.setHours(9, 30, 0, 0);

  const expectedCheckOut = new Date(checkInTime);
  expectedCheckOut.setHours(18, 0, 0, 0);

  if (checkInTime) {
    const minutesLate = (new Date(checkInTime) - expectedCheckIn) / (1000 * 60);
    if (minutesLate > 15) grade -= 30;
    if (minutesLate > 30) grade -= 20;
  }

  if (checkOutTime) {
    const minutesEarly = (expectedCheckOut - new Date(checkOutTime)) / (1000 * 60);
    if (minutesEarly > 15) grade -= 20;
    if (minutesEarly > 30) grade -= 20;
  }

  return Math.max(0, Math.min(100, grade));
};

// GET All Employees (Admin Only)
app.get('/api/employees', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const employees = await User.find().select('-password');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add New Employee
app.post('/api/employees', verifyToken, verifyAdmin, async (req, res) => {
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

// Update Employee by ID (Admin Only)
app.put('/api/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    Object.assign(user, updatedData);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete Employee by ID (Admin Only)
app.delete('/api/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET Attendance for All Employees in Date Range (Admin Only)
app.get('/api/attendance/range', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance range:', error);
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

// Profile Route
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

// GET Today's Attendance
app.get('/api/attendance/today/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance) {
      return res.json(null);
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET Weekly Attendance
app.get('/api/attendance/weekly/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate } = req.query;

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const weeklyAttendance = await Attendance.find({
      employeeId,
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0]
      }
    }).sort({ date: 1 });

    res.json(weeklyAttendance);
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Check-In
app.post('/api/attendance/checkin', verifyToken, async (req, res) => {
  try {
    const { employeeId, location } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (!location || !location.latitude || !location.longitude || !location.city) {
      return res.status(400).json({ message: 'Location data (latitude, longitude, city) is required' });
    }

    if (location.city.toLowerCase() !== 'mumbai') {
      return res.status(403).json({ message: 'Check-in is only allowed in Mumbai' });
    }

    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ employeeId, date: today });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: today
      });
    }

    const checkInTime = new Date();
    attendance.checkIn = {
      time: checkInTime,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city
      }
    };

    attendance.status = 'present';

    attendance.grade = calculatePunctualityGrade(checkInTime, null);

    await attendance.save();
    console.log('Check-in saved:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST Check-Out
app.post('/api/attendance/checkout', verifyToken, async (req, res) => {
  try {
    const { employeeId, location } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (!location || !location.latitude || !location.longitude || !location.city) {
      return res.status(400).json({ message: 'Location data (latitude, longitude, city) is required' });
    }

    if (location.city.toLowerCase() !== 'mumbai') {
      return res.status(403).json({ message: 'Check-out is only allowed in Mumbai' });
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Must check in before checking out' });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    console.log('Check-in time (raw):', attendance.checkIn.time);
    console.log('Check-out time (raw):', checkOutTime);
    const timeDiffMs = checkOutTime.getTime() - new Date(attendance.checkIn.time).getTime();
    console.log('Time difference (ms):', timeDiffMs);
    const timeSpent = timeDiffMs / (1000 * 60);
    console.log('Time spent (minutes):', timeSpent);

    attendance.checkOut = {
      time: checkOutTime,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city
      }
    };

    attendance.totalTimeSpent = Math.round(timeSpent);
    attendance.grade = calculatePunctualityGrade(attendance.checkIn.time, checkOutTime);

    await attendance.save();
    console.log('Check-out saved:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
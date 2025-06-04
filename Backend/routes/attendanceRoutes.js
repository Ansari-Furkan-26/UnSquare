const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
} = require('../controllers/attendanceController');

// Check In
router.post('/checkin', checkIn);

// Check Out
router.post('/checkout', checkOut);

// Get Today's Attendance
router.get('/today/:employeeId', getTodayAttendance);

// Get Weekly Attendance
router.get('/weekly/:employeeId', getWeeklyAttendance);

// Get Monthly Attendance
router.get('/monthly', getMonthlyAttendance);

module.exports = router;
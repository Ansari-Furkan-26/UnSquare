const Attendance = require('../models/Attendance');

// Check In
const checkIn = async (req, res) => {
  try {
    const { employeeId, latitude, longitude } = req.body;
    const today = new Date().toISOString().split('T')[0]; // e.g., "2025-06-04"

    // Check if already checked in today
    let attendance = await Attendance.findOne({ employeeId, date: new Date(today) });
    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    // Create or update attendance record
    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: new Date(today),
        checkIn: { time: new Date(), latitude, longitude },
      });
    } else {
      attendance.checkIn = { time: new Date(), latitude, longitude };
    }

    await attendance.save();
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Out
const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ employeeId, date: new Date(today) });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You must check in first' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOut = { time: new Date() };
    await attendance.save();
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Today's Attendance
const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; // e.g., "2025-06-04"
    const attendance = await Attendance.findOne({ employeeId, date: new Date(date) });
    res.status(200).json(attendance || {});
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Weekly Attendance
const getWeeklyAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate } = req.query; // e.g., "2025-06-02" (Monday of the week)

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday of the week

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Monthly Attendance
const getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, year, month } = req.query; // e.g., year="2025", month="6"
    const start = new Date(year, month - 1, 1); // First day of the month
    const end = new Date(year, month, 0); // Last day of the month

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching monthly attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
};
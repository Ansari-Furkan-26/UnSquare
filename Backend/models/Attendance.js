const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true, // For faster queries by employeeId
  },
  date: {
    type: Date,
    required: true,
    index: true, // For faster queries by date
  },
  checkIn: {
    time: Date,
    latitude: Number,
    longitude: Number,
  },
  checkOut: {
    time: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
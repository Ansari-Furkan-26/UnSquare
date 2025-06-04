const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  joinDate: { type: Date, required: true },
  leavingDate: { type: Date },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
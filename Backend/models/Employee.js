// backend/models/Employee.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  joinDate: { type: Date },
  leavingDate: { type: Date },
  password: { type: String, required: true },
  role: { type: String, default: "employee" }, // Add role field
});

employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
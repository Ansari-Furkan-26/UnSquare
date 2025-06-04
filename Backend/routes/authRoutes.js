const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    console.log('Employee found:', employee);
    if (!employee) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({ success: true, user: { role: employee.role || "employee", email: employee.email } });
  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({ success: false, message: `Login failed: ${error.message}` });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const employee = await Employee.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    console.log('Employee found:', employee);
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare plain-text passwords
    console.log('Stored password:', employee.password);
    if (password !== employee.password) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Store user in session
    req.session.user = { email: employee.email, employeeId: employee.employeeId };
    console.log('Session after login:', req.session);

    res.status(200).json({ success: true, user: { email: employee.email } });
  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ success: false, message: `Login failed: ${error.message}` });
  }
});

router.get('/status', (req, res) => {
  console.log('Checking auth status, session:', req.session);
  if (req.session.user) {
    return res.status(200).json({ success: true, user: req.session.user });
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
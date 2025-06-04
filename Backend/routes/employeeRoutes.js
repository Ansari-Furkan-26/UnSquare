// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
} = require('../controllers/employeeController');

router.post('/', createEmployee); // Create employee
router.put('/:id', updateEmployee); // Update employee
router.get('/:id', getEmployeeById); // Get employee by ID
router.get('/', getAllEmployees); // Get all employees
router.delete('/:id', deleteEmployee); // Delete employee

module.exports = router;
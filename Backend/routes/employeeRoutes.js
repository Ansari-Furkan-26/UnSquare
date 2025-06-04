const express = require('express');
const router = express.Router();
const {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
} = require('../controllers/employeeController');

// Note: Add authentication middleware if certain routes should be restricted (e.g., to admins only)

// Create a new employee (POST /api/employees)
router.post('/', createEmployee);

// Update an employee by ID (PUT /api/employees/:id)
router.put('/:id', updateEmployee);

// Get an employee by ID (GET /api/employees/:id)
router.get('/:id', getEmployeeById);

// Get all employees (GET /api/employees)
router.get('/', getAllEmployees);

// Delete an employee by ID (DELETE /api/employees/:id)
router.delete('/:id', deleteEmployee);

module.exports = router;
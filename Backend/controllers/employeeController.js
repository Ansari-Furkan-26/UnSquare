// backend/controllers/employeeController.js
const Employee = require('../models/Employee');

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Check if employeeId already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: `Employee with employeeId ${employeeId} already exists` });
    }

    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update existing employee by ID
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    // If employeeId is being updated, check for duplicates
    if (employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId, _id: { $ne: id } });
      if (existingEmployee) {
        return res.status(400).json({ message: `Employee with employeeId ${employeeId} already exists` });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate updated data
    });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete employee by ID
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
};
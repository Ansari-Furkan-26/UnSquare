import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const EmployeeForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [errors, setErrors] = useState({}); 
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    employeeId: '',
    position: '',
    department: '',
    phone: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0], 
    leavingDate: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  // Fetch employee data when editing an existing employee
  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem('token'); // Retrieve auth token
          if (!token) {
            toast.error('Please log in to access this page');
            navigate('/login'); // Redirect to login if token is missing
            return;
          }

          const response = await axios.get(`http://localhost:5000/api/employees/${id}`, {
            headers: {
              Authorization: `Bearer ${token}` // Include token in request headers
            }
          });
          const fetchedEmployee = response.data;
          setEmployee({
            ...fetchedEmployee,
            password: '', // Clear password field for security
            confirmPassword: '', // Clear confirm password field
            joinDate: fetchedEmployee.joinDate ? new Date(fetchedEmployee.joinDate).toISOString().split('T')[0] : '',
            leavingDate: fetchedEmployee.leavingDate ? new Date(fetchedEmployee.leavingDate).toISOString().split('T')[0] : ''
          });
        } catch (error) {
          console.error('Error fetching employee:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'Failed to fetch employee data';
          toast.error(errorMessage); // Show error message to user
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token'); // Clear token on auth failure
            navigate('/login'); // Redirect to login
          }
        }
      };
      fetchEmployee();
    }
  }, [id, navigate]);

  // Handle input changes and clear corresponding errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value })); // Update employee state
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for this field
  };

  // Validate form inputs before submission
  const validateForm = () => {
    const newErrors = {};

    if (!employee.name) newErrors.name = 'Full Name is required';
    if (!employee.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!employee.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!employee.position) newErrors.position = 'Position is required';
    if (!employee.department) newErrors.department = 'Department is required';
    if (!employee.phone) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(employee.phone)) {
      newErrors.phone = 'Phone Number must be 10 digits';
    }
    if (!id) { // Password validation only for new employees
      if (!employee.password) {
        newErrors.password = 'Password is required';
      }
      if (employee.password !== employee.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors); // Update errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission (add or update employee)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true); 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        navigate('/login'); 
        return;
      }

      const employeeData = {
        ...employee,
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString() : null,
        leavingDate: employee.leavingDate ? new Date(employee.leavingDate).toISOString() : null
      };
      delete employeeData.confirmPassword; // Remove confirmPassword from API payload

      if (id) {
        await axios.put(`http://localhost:5000/api/employees/${id}`, employeeData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Employee updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/employees', employeeData, {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });
        toast.success('Employee added successfully!');
      }

      // Delay navigation to ensure toast is visible
      setTimeout(() => {
        navigate('/admin/employees');
      }, 1500);
    } catch (error) {
      console.error('❌ Error saving employee:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Something went wrong!';
      toast.error(errorMessage); 
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token'); 
        navigate('/login');
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Employee</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={employee.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                required/>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={employee.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                required/>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={employee.employeeId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.employeeId ? 'border-red-500' : ''
                }`}
                required/>
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
            </div>
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                name="position"
                value={employee.position}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.position ? 'border-red-500' : ''
                }`}
                required/>
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={employee.department}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.department ? 'border-red-500' : ''
                }`}
                required>
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={employee.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                required/>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            {/* Password Fields (only for new employees) */}
            {!id && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={employee.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    required/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-gray-500">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={employee.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    required/>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-10 text-gray-500">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={employee.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </textarea>
            </div>
            {/* Join Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input
                type="date"
                name="joinDate"
                value={employee.joinDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            {/* Leaving Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leaving Date (Optional)</label>
              <input
                type="date"
                name="leavingDate"
                value={employee.leavingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
          </div>
          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/employees')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : id ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
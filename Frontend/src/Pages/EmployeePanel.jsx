import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EmployeeAttendance from '../components/Employee/AttendanceAction';

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in again.');
        }

        // Fetch the logged-in user's profile
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEmployee(response.data.user);
      } catch (error) {
        console.error('Error fetching employee data:', error.response?.data || error.message);
        toast.error('Failed to load employee data. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!employee) {
    return <div className="text-center p-4 text-red-500">Employee data not found. Please log in again.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {employee.name}</h1>
      <EmployeeAttendance employee={employee} />
    </div>
  );
};

export default EmployeeDashboard;
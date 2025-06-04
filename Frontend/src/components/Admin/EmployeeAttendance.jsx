import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminAttendanceDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        navigate('/login');
        return;
      }

      const { data } = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
      toast.error(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Fetch attendance data for date range
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { start, end } = dateRange;

      const { data } = await axios.get('/api/attendance/range', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start, endDate: end }
      });

      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance data';
      toast.error(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format total time spent
  const formatTimeSpent = (minutes) => {
    if (typeof minutes !== 'number' || minutes <= 0) return '--:--';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'N/A'}
      </span>
    );
  };

  useEffect(() => {
    fetchEmployees();
  }, [navigate]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    } else {
      setLoading(false);
    }
  }, [dateRange, employees]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>
      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No employees found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const employeeAttendance = attendanceData
                    .filter(a => a.employeeId === employee.employeeId)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                  if (employeeAttendance.length === 0) {
                    return (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {employee.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500">{employee.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          No attendance records in this period
                        </td>
                      </tr>
                    );
                  }

                  return employeeAttendance.map((attendance) => (
                    <tr key={`${employee._id}-${attendance.date}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <div className="text-sm text-gray-500">{employee.employeeId}</div>
                      </td>                       
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(attendance.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(attendance.checkIn?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(attendance.checkOut?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeSpent(attendance.totalTimeSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(attendance.status)}
                      </td>                     
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceDashboard;
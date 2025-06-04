import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminAttendanceDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });
  const navigate = useNavigate();

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/api/employees');
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch attendance data for date range
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];
      
      const { data } = await axios.get('/api/attendance/range', {
        params: { startDate, endDate }
      });
      
      setAttendanceData(data);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate hours worked
  const calculateHoursWorked = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return diff.toFixed(1);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  }, [dateRange, employees]);

  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Employee Attendance Dashboard</h1>
      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const employeeAttendance = Object.values(attendanceData)
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
                            <div className="text-sm text-gray-500">{employee.employeeId}</div>
                          </div>
                        </div>
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
                        {calculateHoursWorked(attendance.checkIn?.time, attendance.checkOut?.time)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(attendance.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getGradeColor(attendance.grade)}`}>
                          {attendance.grade || '--'}
                        </span>
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
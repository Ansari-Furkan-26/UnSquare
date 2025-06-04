// EmployeeAttendance.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
  const fetchAttendance = async () => {
  try {
    const response = await axios.get('/api/attendance', {
      params: {
        date: date.toISOString().split('T')[0],
        filter
      }
    });

    // Validate response format
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.attendance)
        ? response.data.attendance
        : [];

    setAttendance(data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setAttendance([]); // ensure fallback
    setLoading(false);
  }
};


    fetchAttendance();
  }, [date, filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/attendance/${id}`, { status: newStatus });
      setAttendance(attendance.map(record => 
        record._id === id ? { ...record, status: newStatus } : record
      ));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Employee Attendance</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Employees</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="late">Late Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={record.employee.avatar || '/default-avatar.png'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.employee.name}</div>
                          <div className="text-sm text-gray-500">{record.employee.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record._id, e.target.value)}
                        className={`px-2 py-1 rounded text-sm ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                                   record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                                   'bg-yellow-100 text-yellow-800'}`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.hoursWorked || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
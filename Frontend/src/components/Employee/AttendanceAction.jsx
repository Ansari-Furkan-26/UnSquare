import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeAttendance = ({ employee }) => {
  const [attendanceData, setAttendanceData] = useState({
    today: null,
    weekly: []
  });
  const [loading, setLoading] = useState({
    checkIn: false,
    checkOut: false,
    data: true
  });
  const [motivatingMessage, setMotivatingMessage] = useState(null);

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getWeekDates = () => {
    const today = new Date();
    const result = [];
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 0);
    const monday = new Date(today.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(monday);
      newDate.setDate(monday.getDate() + i);
      result.push(newDate);
    }
    
    return result;
  };

  const getStatusColor = (record) => {
    if (!record) return 'bg-gray-100';

    const grade = record.grade || 0;

    if (grade >= 90) return 'bg-green-400';
    if (grade >= 70) return 'bg-green-300';
    if (grade >= 50) return 'bg-yellow-400';
    if (grade >= 30) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const fetchAttendanceData = async () => {
    if (!employee?.employeeId) {
      console.error('Employee ID is missing. Cannot fetch attendance data.');
      toast.error('Employee data is missing. Please log in again.');
      setLoading(prev => ({ ...prev, data: false }));
      return;
    }

    console.log('Fetching attendance data for employee:', employee.employeeId);
    try {
      setLoading(prev => ({ ...prev, data: true }));
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const todayResponse = await axios.get(`/api/attendance/today/${employee.employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Today response:', todayResponse.data);

      const monday = getWeekDates()[0].toISOString().split('T')[0];
      const weeklyResponse = await axios.get(`/api/attendance/weekly/${employee.employeeId}?startDate=${monday}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Weekly response:', weeklyResponse.data);

      setAttendanceData({
        today: todayResponse.data,
        weekly: weeklyResponse.data
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error.response?.data || error.message);
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  const handleCheckIn = async () => {
    if (!employee?.employeeId) {
      console.error('Employee ID is missing. Cannot check in.');
      toast.error('Employee data is missing. Please log in again.');
      return;
    }

    console.log('Check In button clicked for employee:', employee.employeeId);
    try {
      setLoading(prev => ({ ...prev, checkIn: true }));
      const token = localStorage.getItem('token');
      console.log('Token for check-in:', token);

      const response = await axios.post('/api/attendance/checkin', {
        employeeId: employee.employeeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Check-in response:', response.data);

      setAttendanceData(prev => ({
        ...prev,
        today: response.data
      }));
      
      toast.success(`Checked in at ${new Date(response.data.checkIn.time).toLocaleTimeString()}`);
    } catch (error) {
      console.error('Check-in error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(prev => ({ ...prev, checkIn: false }));
    }
  };

  const handleCheckOut = async () => {
    if (!employee?.employeeId) {
      console.error('Employee ID is missing. Cannot check out.');
      toast.error('Employee data is missing. Please log in again.');
      return;
    }

    console.log('Check Out button clicked for employee:', employee.employeeId);
    try {
      setLoading(prev => ({ ...prev, checkOut: true }));
      const token = localStorage.getItem('token');
      console.log('Token for check-out:', token);

      const response = await axios.post('/api/attendance/checkout', {
        employeeId: employee.employeeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Check-out response:', response.data);

      setAttendanceData(prev => ({
        ...prev,
        today: response.data,
        weekly: prev.weekly.map(record => 
          record.date === response.data.date ? response.data : record
        )
      }));
      
      toast.success(`Checked out at ${new Date(response.data.checkOut.time).toLocaleTimeString()}`);
      setMotivatingMessage('Great job today! See you tomorrow! 🌟');
    } catch (error) {
      console.error('Check-out error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(prev => ({ ...prev, checkOut: false }));
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [employee]);

  if (!employee?.employeeId) {
    return <div className="text-center p-4 text-red-500">Employee data is missing. Please log in again.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Today's Attendance</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Status</h3>
            <p className="text-base sm:text-lg">
              {attendanceData.today?.status 
                ? (
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    attendanceData.today.status === 'present' ? 'bg-green-100 text-green-800' :
                    attendanceData.today.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {attendanceData.today.status}
                  </span>
                )
                : 'Not checked in'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Check-in</h3>
            <p className="text-base sm:text-lg">
              {attendanceData.today?.checkIn 
                ? new Date(attendanceData.today.checkIn.time).toLocaleTimeString()
                : '--:--'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Check-out</h3>
            <p className="text-base sm:text-lg">
              {attendanceData.today?.checkOut?.time 
                ? new Date(attendanceData.today.checkOut.time).toLocaleTimeString()
                : '--:--'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Time Spent</h3>
            <p className="text-base sm:text-lg">
              {attendanceData.today?.totalTimeSpent 
                ? `${Math.floor(attendanceData.today.totalTimeSpent / 60)}h ${attendanceData.today.totalTimeSpent % 60}m`
                : '--:--'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {!attendanceData.today?.checkIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading.checkIn || !employee?.employeeId}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {loading.checkIn ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Check In'}
            </button>
          ) : !attendanceData.today?.checkOut?.time ? (
            <button
              onClick={handleCheckOut}
              disabled={loading.checkOut || !employee?.employeeId}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {loading.checkOut ? 'Processing...' : 'Check Out'}
            </button>
          ) : (
            <div className="text-center w-full sm:w-auto">
              <p className="text-gray-500 text-sm sm:text-base">Attendance completed for today</p>
              {motivatingMessage && (
                <p className="text-green-600 font-medium mt-2 text-sm sm:text-base">{motivatingMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Weekly Attendance</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
  Color grades show punctuality:&nbsp;
  <span className="inline-flex items-center mr-2">
    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>On Time
  </span>
  <span className="inline-flex items-center mr-2">
    <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>Late
  </span>
  <span className="inline-flex items-center">
    <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>Absent
  </span>
</p>

        
        <div className="overflow-x-auto">
          <table className="min-w-[700px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {weekdays.map((day, index) => {
                  const date = getWeekDates()[index];
                  return (
                    <th 
                      key={index}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] sm:text-xs">{day.slice(0, 3)}</span>
                        <span className="font-normal text-[10px] sm:text-xs">{date.getDate()}/{date.getMonth()+1}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                {getWeekDates().map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const record = attendanceData.weekly.find(d => 
                    new Date(d.date).toISOString().split('T')[0] === dateStr
                  );
                  const isToday = new Date().toDateString() === date.toDateString();
                  const colorClass = getStatusColor(record);
                  
                  return (
                    <td 
                      key={index} 
                      className={`px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap ${isToday ? 'border-2 border-blue-500' : ''}`}
                    >
                      <div className={`${colorClass} p-2 sm:p-3 rounded-lg text-center text-[10px] sm:text-xs`}>
                        {record ? (
                          <>
                            <p className="font-medium">
                              {record.checkIn ? new Date(record.checkIn.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </p>
                            <p>
                              {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </p>
                            <p className="mt-1 font-medium">
                              {record.status} (Grade: {record.grade})
                            </p>
                            {record.totalTimeSpent && (
                              <p className="mt-1">
                                Time: {Math.floor(record.totalTimeSpent / 60)}h {record.totalTimeSpent % 60}m
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-600">No record</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
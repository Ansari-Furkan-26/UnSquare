import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AttendanceAction = ({ employee }) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [workLocation] = useState({
    latitude: 19.0760, // Mumbai coordinates (example)
    longitude: 72.8777,
    radius: 0.5, // 0.5km radius
  });

  // Guard clause: If employee or employeeId is undefined, show a fallback UI
  if (!employee || !employee.employeeId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center text-gray-500">
        Loading employee data...
      </div>
    );
  }

  // Calculate total hours worked between check-in and check-out
  const calculateHoursWorked = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffMs = new Date(checkOut) - new Date(checkIn);
    return (diffMs / (1000 * 60 * 60)).toFixed(2); // Convert to hours with 2 decimal places
  };

  // Get Monday of the current week
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Check today's attendance status on load
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`/api/attendance/today/${employee.employeeId}?date=${today}`);
        setTodayAttendance(response.data);
        if (response.data.checkIn && !response.data.checkOut) {
          setCurrentStatus('checkedIn');
        } else if (response.data.checkOut) {
          setCurrentStatus('checkedOut');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }
    };
    fetchTodayAttendance();
  }, [employee.employeeId]);

  // Fetch weekly attendance for the current week on load
  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      try {
        const monday = getMonday(new Date()).toISOString().split('T')[0];
        const response = await axios.get(`/api/attendance/weekly/${employee.employeeId}?startDate=${monday}`);
        setWeeklyAttendance(response.data);
      } catch (err) {
        console.error('Error fetching weekly attendance:', err);
      }
    };
    fetchWeeklyAttendance();
  }, [employee.employeeId]);

  // Fetch monthly attendance when month or year changes
  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      try {
        const response = await axios.get(`/api/attendance/monthly`, {
          params: { employeeId: employee.employeeId, year: selectedYear, month: selectedMonth },
        });
        setWeeklyAttendance(response.data);
      } catch (err) {
        console.error('Error fetching monthly attendance:', err);
      }
    };
    fetchMonthlyAttendance();
  }, [employee.employeeId, selectedMonth, selectedYear]);

  // Get current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const handleCheckIn = async () => {
    getLocation();

    if (!location) {
      setTimeout(() => {
        if (!location) {
          toast.error('Please enable location services');
          return;
        }
        proceedWithCheckIn();
      }, 1000);
      return;
    }

    proceedWithCheckIn();
  };

  const proceedWithCheckIn = async () => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      workLocation.latitude,
      workLocation.longitude
    );

    if (distance > workLocation.radius) {
      toast.error(`You must be within ${workLocation.radius}km of the workplace to check in`);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/attendance/checkin', {
        employeeId: employee.employeeId,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setCurrentStatus('checkedIn');
      setTodayAttendance(response.data.attendance);
      toast.success('Checked in successfully!');
    } catch (err) {
      toast.error('Error checking in: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/attendance/checkout', {
        employeeId: employee.employeeId,
      });
      setCurrentStatus('checkedOut');
      setTodayAttendance(response.data.attendance);
      toast.success('Checked out successfully!');
    } catch (err) {
      toast.error('Error checking out: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Attendance</h2>

      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Today's Attendance */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Today ({new Date().toLocaleDateString()})</h3>
          {todayAttendance?.checkIn && (
            <div className="bg-blue-50 p-3 rounded-lg mb-2">
              <p className="font-medium">Check-in Time:</p>
              <p>{new Date(todayAttendance.checkIn.time).toLocaleTimeString()}</p>
            </div>
          )}
          {todayAttendance?.checkOut && (
            <div className="bg-green-50 p-3 rounded-lg mb-2">
              <p className="font-medium">Check-out Time:</p>
              <p>{new Date(todayAttendance.checkOut.time).toLocaleTimeString()}</p>
            </div>
          )}
          {todayAttendance?.checkIn && todayAttendance?.checkOut && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="font-medium">Total Hours Worked:</p>
              <p>{calculateHoursWorked(todayAttendance.checkIn.time, todayAttendance.checkOut.time)} hours</p>
            </div>
          )}
          {!todayAttendance?.checkIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Verifying Location...' : 'Check In'}
            </button>
          )}
          {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          )}
        </div>

        {/* Filter by Month and Year */}
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekly/Historical Attendance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Attendance History</h3>
          {weeklyAttendance.length === 0 ? (
            <p className="text-gray-500">No attendance records found.</p>
          ) : (
            <div className="space-y-4">
              {weeklyAttendance.map((record) => (
                <div key={record._id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    Date: {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {record.checkIn && (
                    <p>Check-in: {new Date(record.checkIn.time).toLocaleTimeString()}</p>
                  )}
                  {record.checkOut && (
                    <p>Check-out: {new Date(record.checkOut.time).toLocaleTimeString()}</p>
                  )}
                  {record.checkIn && record.checkOut && (
                    <p>Total Hours: {calculateHoursWorked(record.checkIn.time, record.checkOut.time)} hours</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Info */}
        {location && (
          <div className="text-sm text-gray-600 mt-4">
            <p>Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
            <p>Work location: {workLocation.latitude}, {workLocation.longitude}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAction;
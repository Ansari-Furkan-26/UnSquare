import { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
   const fetchHistory = async () => {
  try {
    const res = await axios.get(`/api/attendance/history/${userId}`);
    const records = Array.isArray(res.data) ? res.data : res.data.history || [];
    setHistory(records);
  } catch (err) {
    console.error('Error fetching history:', err);
    setHistory([]); // fallback to empty array
  }
};

    fetchHistory();
  }, [userId]);

  const getColor = (hours = 0) => {
  if (hours >= 8) return 'bg-green-500';
  if (hours >= 4) return 'bg-yellow-500';
  return 'bg-red-500';
};


  return (
    <div className="bg-white shadow rounded p-6 w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Your Attendance History</h2>
      <div className="grid grid-cols-7 gap-2">
       {Array.isArray(history) && history.length > 0 ? (
  history.map((record, idx) => (
    <div
      key={idx}
      className={`h-16 rounded text-white text-center text-sm flex items-center justify-center ${getColor(
        record.hoursWorked
      )}`}
      title={`In: ${record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}\nOut: ${
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'
      }\nHours: ${record.hoursWorked ?? 'N/A'}`}
    >
      {record.date ? new Date(record.date).getDate() : '–'}
    </div>
  ))
) : (
  <p className="text-gray-500 col-span-7 text-center mt-4">No attendance records found.</p>
)}

      </div>
    </div>
  );
};

export default AttendanceHistory;
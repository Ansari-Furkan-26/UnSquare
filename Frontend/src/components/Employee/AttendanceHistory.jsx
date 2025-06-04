import { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceSummary = ({ employeeId }) => {
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      try {
        const response = await axios.get('/api/attendance/monthly', {
          params: { employeeId, year: 2025, month: 6 },
        });
        setMonthlyAttendance(response.data);
      } catch (err) {
        console.error('Error fetching monthly attendance:', err);
      }
    };
    fetchMonthlyAttendance();
  }, [employeeId]);

  return (
    <div>
      <h3>Monthly Attendance Summary</h3>
      {monthlyAttendance.map((record) => (
        <div key={record._id}>
          <p>Date: {new Date(record.date).toLocaleDateString()}</p>
          <p>Check-in: {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : 'N/A'}</p>
          <p>Check-out: {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : 'N/A'}</p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummary;
import { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceAction = ({ user }) => {
  const [status, setStatus] = useState(null);
  const [locationAllowed, setLocationAllowed] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const allowedCoords = { lat: 19.233, lng: 72.843 }; // set your allowed GPS location
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const withinRange =
          Math.abs(userLat - allowedCoords.lat) < 0.01 &&
          Math.abs(userLng - allowedCoords.lng) < 0.01;

        setLocationAllowed(withinRange);
      },
      () => setLocationAllowed(false)
    );
  }, []);

  const handleCheck = async (type) => {
    try {
      const res = await axios.post(`/api/attendance/${type}`, { userId: user._id });
      setStatus(`${type} successful at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error(err);
      setStatus('Error performing action');
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 w-full max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <p className="text-gray-600 mb-4">Position: {user.position}</p>

      {locationAllowed ? (
        <div className="flex space-x-4">
          <button
            onClick={() => handleCheck('checkin')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Check-In
          </button>
          <button
            onClick={() => handleCheck('checkout')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Check-Out
          </button>
        </div>
      ) : (
        <p className="text-red-600">You're not in the allowed location to check in/out.</p>
      )}

      {status && <p className="mt-4 text-blue-600">{status}</p>}
    </div>
  );
};

export default AttendanceAction;
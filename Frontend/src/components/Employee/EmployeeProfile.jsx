import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/login'); 
      } finally {
        setLoading(false); 
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className=" mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <Navbar />

      {/* Profile Header Section */}
      <div className="bg-blue-600 p-6 text-white">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-blue-100">{user.position} - {user.department}</p>
      </div>

      {/* Profile Details Section */}
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
            <p className="mt-1">{user.employeeId}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{user.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1">{user.phone}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1">{user.address}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
            <p className="mt-1">
              {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Link to Attendance Page */}
        <div className="mt-6 text-center">
          <a href="/employees" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            ➤ Mark your attendance
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;

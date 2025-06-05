import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Check and set user on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user from storage
    setUser(null); // Clear state
    navigate('/login'); // Redirect to login
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 sm:px-8 lg:px-12 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo or Brand Name */}
        <Link to="/" className="hidden sm:block text-gray-600 hover:text-indigo-600 font-medium transition-colors">
          <h1 className="text-2xl font-bold text-indigo-600">UnSquare</h1>
        </Link>

        {/* Right Side User Actions */}
        <div className="relative">
          
          {/* If no user is logged in, show Login button */}
          {!user ? (
            <Link to="/login">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Login
              </button>
            </Link>
          ) : (
            // If user is logged in, show initial avatar and dropdown menu
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold text-lg flex items-center justify-center hover:bg-indigo-700 focus:outline-none">
                {user.name?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-md z-10">
                  <button
                    onClick={() => navigate('/employees/profile')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

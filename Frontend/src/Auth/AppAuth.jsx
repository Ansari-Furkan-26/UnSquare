import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';

const AppAuth = () => {
  const { setisLoggedin, setuserData, getAuthStatus } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: '', password: '' }); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // React Router navigation
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'email' ? value.trim() : value;
    setFormData({ ...formData, [name]: newValue });
    setError('');
  };

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      // ✅ Hardcoded admin login
      if (formData.email === 'admin@gmail.com' && formData.password === 'Admin@123') {
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('userEmail', formData.email);
        setisLoggedin(true);
        setuserData({ email: formData.email, role: 'admin' });
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
        return;
      }

      // 🔐 Send login request to backend
      const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('user', JSON.stringify(data.user));

      setisLoggedin(true);
      setuserData(data.user);
      await getAuthStatus();

      toast.success('Login successful!');
      navigate('/employees'); // Redirect to employees page
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email input */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Password input */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {/* Toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Logging in...' : (
              <>
                Login <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppAuth;

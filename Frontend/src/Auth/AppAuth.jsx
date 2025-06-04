import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { AppContext } from "../context/AppContext"; // Adjust the import path as needed

const AuthForm = () => {
  const { backendURL } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      // Check for admin credentials first (bypassing MongoDB)
      if (formData.email === "admin@gmail.com" && formData.password === "Admin@123") {
        console.log("Admin login successful");
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
        return; // Exit early to avoid MongoDB check
      }

      // For non-admin users, authenticate via MongoDB
      const { data } = await axios.post(
        `${backendURL}/api/auth/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Login successful!");
        navigate("/employees"); // Redirect all non-admin users to /notification
      } else {
        const errorMessage = data.message || "Invalid email or password.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      let errorMessage = "An unexpected error occurred.";
      if (err.response) {
        if (typeof err.response.data === "string" && err.response.data.includes("Cannot POST")) {
          errorMessage = "Backend server error: Unable to reach login endpoint.";
        } else {
          errorMessage = err.response.data?.message || "Invalid email or password.";
        }
      } else if (err.message === "Network Error") {
        errorMessage = "Unable to connect to the server. Please check if the backend is running.";
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Email Address"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password} // Fixed bug: changed from formData.email to formData.password
              onChange={handleChange}
              required
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                Login <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>
        <p
          className="text-blue-600 text-center mt-4 cursor-pointer hover:underline"
          onClick={() => navigate("/forget")}
        >
          Forgot Password?
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
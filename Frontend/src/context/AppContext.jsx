import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();
const AppContextProvider = ({ children }) => {
  const backendURL = "http://localhost:5000";
  const [isLoggedin, setisLoggedin] = useState(false);
  const [userData, setuserData] = useState(null);

  const getAuthStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // If no token found, set user as not logged in
      if (!token) {
        setisLoggedin(false);
        setuserData(null);
        return;
      }

      // Make authenticated request to fetch user profile
      const { data } = await axios.get(`${backendURL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If user data is returned, update login state
      if (data.user) {
        setisLoggedin(true);
        setuserData(data.user);
      } else {
        setisLoggedin(false);
        setuserData(null);
      }
    } catch (error) {
      // Log any error and reset user state
      console.error("Error in getAuthStatus:", error.response?.data || error.message);
      setisLoggedin(false);
      setuserData(null);
    }
  };

  // useEffect to check authentication status once on component mount
  useEffect(() => {
    getAuthStatus();
  }, []);

  // Object that holds all context values to be provided
  const value = {
    backendURL,
    isLoggedin,
    setisLoggedin,
    userData,
    setuserData,
    getAuthStatus,
  };

  // Provide the context values to the children components
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

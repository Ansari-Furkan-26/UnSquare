import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

// Create the context
export const AppContext = createContext();

// Define the AppContextProvider component
const AppContextProvider = ({ children }) => {
  // Backend URL from environment variables
  const backendURL = "http://localhost:5000";
  // const backendURL = "https://onemenu-deployemnt-musk.onrender.com";

  // State for login status
  const [isLoggedin, setisLoggedin] = useState(false);

  // State for storing user data
  const [userData, setuserData] = useState(null);


  const getUserData = async () => {
    // Function to fetch user data
    const token = localStorage.getItem("authToken");
    if (!token) return; // Prevent request if no token

    try {
      const { data } = await axios.get(`${backendURL}/api/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (data.success) {
        setuserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data");
    }
  };

  // Function to check authentication status
  const getAuthStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        setisLoggedin(false);
        setuserData(null);
        return;
    }

    try {
        const { data } = await axios.get(`${backendURL}/api/auth/is-auth`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (data.success) {
            setisLoggedin(true);
            setuserData(data.user);
        } else {
            setisLoggedin(false);
            setuserData(null);
        }
    } catch (error) {
        console.error("Error in getAuthStatus:", error);
        setisLoggedin(false);
        setuserData(null);
    }
};



  // Use effect to check authentication status on component mount
  useEffect(() => {
    getAuthStatus();
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  const value = {
    backendURL, // Backend URL for API calls
    isLoggedin, setisLoggedin, // Login state and setter
    userData, setuserData, // User data and setter
    getUserData, // Function to manually fetch user data
  };

  // Return the context provider
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider; 
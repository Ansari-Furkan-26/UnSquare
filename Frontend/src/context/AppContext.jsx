import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendURL = "http://localhost:5000";
  const [isLoggedin, setisLoggedin] = useState(false);
  const [userData, setuserData] = useState(null);

  const getAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setisLoggedin(false);
        setuserData(null);
        return;
      }

      const { data } = await axios.get(`${backendURL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.user) {
        setisLoggedin(true);
        setuserData(data.user);
      } else {
        setisLoggedin(false);
        setuserData(null);
      }
    } catch (error) {
      console.error("Error in getAuthStatus:", error.response?.data || error.message);
      setisLoggedin(false);
      setuserData(null);
    }
  };

  useEffect(() => {
    getAuthStatus();
  }, []);

  const value = {
    backendURL,
    isLoggedin,
    setisLoggedin,
    userData,
    setuserData,
    getAuthStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
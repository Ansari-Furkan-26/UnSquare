import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // required styling

import AppContextProvider from './context/AppContext';
import AppAuth from './Auth/AppAuth';
import EmployeePanel from './Pages/EmployeePanel'; 
import AdminDashboard from './Pages/AdminPanel';
import AdminForm from './Pages/AdminForm';
import Hero from './Pages/Hero';

function App() {
  return (
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<AppAuth />} />
          <Route path="/admin/employees" element={<AdminForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<EmployeePanel />} />
        </Routes>
      </Router>

      {/* ToastContainer goes outside Router but inside context/provider */}
      <ToastContainer/>
    </AppContextProvider>
  );
}

export default App;

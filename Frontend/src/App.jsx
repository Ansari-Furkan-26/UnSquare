import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppContextProvider from './context/AppContext';
import AppAuth from './Auth/AppAuth';
import EmployeePanel from './Pages/EmployeePanel'; 
import AdminDashboard from './Pages/AdminPanel';
import AdminForm from './Pages/AdminForm';

function App() {
  return (
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AppAuth />} />
          <Route path="/admin/employees" element={<AdminForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<EmployeePanel />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
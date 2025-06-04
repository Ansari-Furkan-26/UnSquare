import AttendanceAction from '../components/Employee/AttendanceAction';
import EmployeeProfile from '../components/Employee/EmployeeProfile';
import Navbar from '../components/Navbar';

const EmployeePanel = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
      <EmployeeProfile />
      <AttendanceAction />
      </div>
    </div>
  );
};

export default EmployeePanel;
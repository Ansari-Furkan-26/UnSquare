import AttendanceAction from '../components/Employee/AttendanceAction';
import AttendanceHistory from '../components/Employee/AttendanceHistory';
import Navbar from '../components/Navbar';

const mockUser = {
  _id: 'u123',
  name: 'John Doe',
  position: 'Frontend Developer',
};

const EmployeePanel = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
      <AttendanceAction user={mockUser} />
      <AttendanceHistory userId={mockUser._id} />
      </div>
    </div>
  );
};

export default EmployeePanel;
import AdminSidebar from '../components/Admin/AdminSidebar';
import EmployeeForm from '../components/Admin/EmployeeForm';


const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">          
          <EmployeeForm />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
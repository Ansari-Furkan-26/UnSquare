// AdminSidebar.jsx
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-indigo-800 text-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/employees"
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Employee Management
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Users, Building2, UserPlus, FolderPlus } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Departments from './pages/Departments.jsx';
import AddEmployee from './pages/AddEmployee.jsx';
import AddDepartment from './pages/AddDepartment.jsx';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🏢 EmpDirectory</h1>
        <p>HR Management System</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/employees" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={18} /> Employees
        </NavLink>
        <NavLink to="/departments" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 size={18} /> Departments
        </NavLink>
        <NavLink to="/employees/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserPlus size={18} /> Add Employee
        </NavLink>
        <NavLink to="/departments/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderPlus size={18} /> Add Department
        </NavLink>
      </nav>
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const titles = {
    '/dashboard': { title: 'Dashboard', sub: 'Overview of your organization' },
    '/employees': { title: 'Employees', sub: 'Manage your workforce' },
    '/departments': { title: 'Departments', sub: 'Manage departments' },
    '/employees/new': { title: 'Add Employee', sub: 'Register a new employee' },
    '/departments/new': { title: 'Add Department', sub: 'Create a new department' },
  };
  const current = titles[location.pathname] || { title: 'Employee Directory', sub: '' };

  return (
    <>
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <h2>{current.title}</h2>
            <p>{current.sub}</p>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/employees/new" element={<Layout><AddEmployee /></Layout>} />
        <Route path="/departments" element={<Layout><Departments /></Layout>} />
        <Route path="/departments/new" element={<Layout><AddDepartment /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

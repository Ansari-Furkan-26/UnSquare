import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./Auth/AppAuth";

import Hero from './pages/Hero';
import AdminPanel from './pages/AdminPanel';
import AdminForm from './pages/AdminForm';
import EmployeePanel from './pages/EmployeePanel';


export default function App() {
  return (
    <BrowserRouter>
        <ToastContainer />
      <Routes>
            {/* Auth Pages */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          <Route path="/admin/employees" element={<AdminForm />} />   
          <Route path="/employees" element={<EmployeePanel />} />           
      </Routes>
    </BrowserRouter>
  );
}
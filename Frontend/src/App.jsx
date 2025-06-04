import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Auth/AppAuth";

import Hero from './pages/Hero';
import AdminPanel from './pages/AdminPanel';
import AdminForm from './pages/AdminForm';
import EmployeePanel from './pages/EmployeePanel';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
            {/* Auth Pages (No Navbar/Footer) */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          <Route path="/admin/employees" element={<AdminForm />} />   
          <Route path="/employees" element={<EmployeePanel />} />           
      </Routes>
    </BrowserRouter>
  );
}
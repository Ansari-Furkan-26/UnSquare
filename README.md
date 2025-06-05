# 👨‍💼 Employee Attendance System (MERN Stack)

A full-featured Employee Attendance System built using **MongoDB, Express, React, and Node.js**. It supports admin and employee roles with secure authentication, location-based attendance logging, and performance grading.

---

## 📝 Problem Statement

Build an attendance system where employees can **check in/check out based on location**, and admins can manage employees and monitor attendance effectively.

This system ensures:
- Employees can only mark attendance **from a specific location** (e.g., office).
- Admins have full control to **manage employees and view attendance reports**.
- Employees are **visually graded** based on punctuality to promote on-time culture.

---

## 🌟 Key Features

### 🛠️ Admin Panel
- ➕ Add, ✏️ Edit, and ❌ Delete employees
- 📊 View employee attendance logs

### 👨‍💻 Employee Panel
- 🔐 Secure login
- 📍 Location-based **Check In / Check Out**
- 📆 View past attendance records

### 🔐 Authentication
- Simple JWT-based login for both Admin and Employee roles

### 🟢 Attendance Grading System
- Color-coded system (e.g., Green, Yellow, Red) to show punctuality performance
- Motivates employees to be on time consistently

---

## 🚀 Tech Stack

| Frontend        | Backend        | Database | Auth     | Others              |
|----------------|----------------|----------|----------|---------------------|
| React.js        | Node.js         | MongoDB  | JWT      | Axios, React Router |
| React Toastify | Express.js      | Mongoose |          |             |

---

## 🛠️ Local Setup

## 🛠️ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 🔧 Backend Setup
```bash
cd backend
npm install
npm start

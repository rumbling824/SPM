// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import BookSearch from './pages/BookSearch';
import PersonalCenter from './pages/PersonalCenter';
import MyBorrows from './pages/MyBorrows';
import ReaderLayout from './components/ReaderLayout';

// 路由守卫组件
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ReaderLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="search" element={<BookSearch />} />
        <Route path="profile" element={<PersonalCenter />} />
        <Route path="my-borrows" element={<MyBorrows />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
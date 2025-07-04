import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';

export const RequireUsername = () => {
  const userId = useSelector(state => state.user.userId);
  const hasUsername = !!userId;
  return hasUsername ? <Outlet /> : <Navigate to="/" replace />;
};

export const AlreadyLogined = ({ children }) => {
  const userId = useSelector(state => state.user.userId);
  const hasUserId = !!userId;
  const location = useLocation();
  if (hasUserId && location.pathname === "/") {
    return <Navigate to="/node" replace />;
  }
  return children;
};



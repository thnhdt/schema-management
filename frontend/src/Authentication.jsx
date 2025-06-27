import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const RequireUsername = () => {
  const hasUsername = !!sessionStorage.getItem("username");

  return hasUsername ? <Outlet /> : <Navigate to="/" replace />;
};


export const AlreadyLogined = ({ children }) => {
  const hasUsername = !!sessionStorage.getItem("username");
  const location = useLocation();

  if (hasUsername && location.pathname === "/") {
    return <Navigate to="/sheet" replace />;
  }
  return children;
};


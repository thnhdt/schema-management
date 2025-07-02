import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // axios instance của bạn
import { message } from 'antd';
export default function AxiosInterceptor({ children }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 403) {
          messageApi.open({
            key: 'expired',
            type: 'error',
            content: 'Hết phiên đăng nhập. Sẽ quay lại trang đăng nhập!',
          });
          setTimeout(() => {
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            navigate('/', { replace: true });
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  return (<>
    {contextHolder}
    {children}
  </>)

}

export const RequireUsername = () => {
  const hasUsername = !!sessionStorage.getItem("userId");

  return hasUsername ? <Outlet /> : <Navigate to="/" replace />;
};


export const AlreadyLogined = ({ children }) => {
  const hasUserId = !!sessionStorage.getItem("userId");
  const location = useLocation();

  if (hasUserId && location.pathname === "/") {
    return <Navigate to="/sheet" replace />;
  }
  return children;
};



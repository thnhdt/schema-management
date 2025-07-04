import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { message } from 'antd';
import { useSelector } from 'react-redux';
export default function AxiosInterceptor({ children }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        if (status === 403) {
          messageApi.open({
            key: 'expired',
            type: 'error',
            content: 'Hết phiên đăng nhập. Sẽ quay lại trang đăng nhập!',
          });
          // await logout();
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [messageApi, navigate]);

  return (<>
    {contextHolder}
    {children}
  </>)

}

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



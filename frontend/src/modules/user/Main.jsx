import { useNavigate } from 'react-router-dom';
import { Select, Button, message, Card, Typography, Space, Input } from 'antd';
import '../../App.css'
import { useRef } from 'react';
import { login } from '../../api/index.js';
import { useDispatch } from 'react-redux';
import { setCredentials } from './userSlice';
import Register from './Register';
import { forgetPassword } from '../../api/user';

function Main() {
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();
  const handleSubmit = async () => {
    try {
      const data = await login(emailRef.current.input.value, passwordRef.current.input.value);
      const user = data.metaData.metaData.user;
      const token = data.metaData.metaData.tokens.accessToken;
      const userId = user.userId;
      const username = user.name;
      const roles = Array.isArray(user.roles) ? user.roles : [];
      dispatch(setCredentials({ token, roles, userId, username, isAdmin: user.isAdmin }));
      navigate('/node', { replace: true });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Nhập sai email hoặc mật khẩu!',
      });
      console.error('Error: ', error.message);
    }
  }

  const handleForgetPassword = async () => {
    const email = emailRef.current.input.value;
    if (!email) {
      messageApi.open({ type: 'error', content: 'Vui lòng nhập email!' });
      return;
    }
    try {
      await forgetPassword(email);
      messageApi.open({ type: 'success', content: 'Đã gửi email đặt lại mật khẩu!' });
    } catch (error) {
      messageApi.open({ type: 'error', content: error?.response?.data?.message || 'Gửi email thất bại!' });
    }
  }

  return (
    <>
      {contextHolder}
      <div className="login-container">
        <Card className="login-card" bordered={false} style={{ maxWidth: 350, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>Schema Management</Typography.Title>
            <Input placeholder="Nhập email" ref={emailRef} />
            <Input.Password placeholder="input password" ref={passwordRef} />
            {/* <Button type='primary' size="large" block onClick={handleSubmit} disabled={!name}>Đặt cơm</Button> */}
            <Button type='primary' size="large" block onClick={handleSubmit}>Đăng Nhập</Button>
            <Button type='primary' size="large" block onClick={() => {
              navigate('/register');
            }
            }>Đăng ký</Button>
            <Button variant='text' size='small' block onClick={handleForgetPassword}>Quên mật khẩu</Button>
          </Space>
        </Card>

      </div>
    </>
  );
}

export default Main;
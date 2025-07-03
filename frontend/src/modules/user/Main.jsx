import { useNavigate } from 'react-router-dom';
import { Select, Button, message, Card, Typography, Space, Input } from 'antd';
import '../../App.css'
import { useRef } from 'react';
import { login } from '../../api/index.js';
import { useGlobalUser } from '../../App.jsx';
import Register from './Register';

function Main() {
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { _ , setUser } = useGlobalUser();
  const handleSubmit = async () => {
    try {
      const data = await login(emailRef.current.input.value, passwordRef.current.input.value);
      setUser(data.metaData.metaData.user);
      sessionStorage.setItem('token', data.metaData.metaData.tokens.accessToken);
      sessionStorage.setItem('username', data.metaData.metaData.user.name);
      sessionStorage.setItem('userId', data.metaData.metaData.user.userId);
      navigate('/node', { replace: true });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Nhập sai email hoặc mật khẩu!',
      });
      console.error('Error: ', error.message);
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
          </Space>
        </Card>

      </div>
    </>
  );
}

export default Main;
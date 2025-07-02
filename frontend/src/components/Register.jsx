import { useNavigate } from 'react-router-dom';
import { Select, Button, message, Card, Typography, Space, Input } from 'antd';
import '../App.css'
import { useState, useEffect, useRef } from 'react';
import { login, signUp } from '../api/index.js';

function Main() {
  // const [name, setName] = useState('');
  // const [userOptions, setUserOptions] = useState([]);
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const nameRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (e) => {
    try {
      const dataRegister = {
        email: emailRef.current.input.value,
        password: passwordRef.current.input.value,
        name: nameRef.current.input.value,
        role: ['user']
      }
      const data = await signUp(dataRegister);
      sessionStorage.setItem('token', data.metaData.metaData.tokens.accessToken);
      sessionStorage.setItem('username', data.metaData.metaData.user.name);
      sessionStorage.setItem('userId', data.metaData.metaData.user.userId);
      navigate('/sheet');
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
            <Input placeholder="Nhập họ và tên" ref={nameRef} />
            <Input placeholder="Nhập email" ref={emailRef} />
            <Input.Password placeholder="input password" ref={passwordRef} />
            {/* <Button type='primary' size="large" block onClick={handleSubmit} disabled={!name}>Đặt cơm</Button> */}
            <Button type='primary' size="large" block onClick={handleSubmit}>Đăng ký</Button>
          </Space>
        </Card>

      </div>
    </>
  );
}

export default Main;
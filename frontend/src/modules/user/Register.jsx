import { useNavigate } from 'react-router-dom';
import { Button, message, Card, Typography, Space, Input } from 'antd';
import '../../App.css'
import { useRef } from 'react';
import { login, signUp } from '../../api/index.js';

function Register() {
  // const [name, setName] = useState('');
  // const [userOptions, setUserOptions] = useState([]);
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const nameRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async () => {
    try {
      const email = emailRef.current.input.value.trim();
      const password = passwordRef.current.input.value;
      const name = nameRef.current.input.value.trim();

      if (!name || !email || !password) {
        messageApi.open({
          type: 'error',
          content: 'Vui lòng đầy đủ nội dung!',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        messageApi.open({
          type: 'error',
          content: 'Email không hợp lệ!',
        });
        return;
      }

      const dataRegister = {
        email: email,
        password: password,
        name: name,
        roles: ['user']
      }
      await signUp(dataRegister);
      messageApi.open({
        type: 'success',
        content: 'Đăng ký thành công! Đang đăng nhập...',
      });
      try {
        const loginData = await login(email, password);
        sessionStorage.setItem('token', loginData.metaData.metaData.tokens.accessToken);
        sessionStorage.setItem('username', loginData.metaData.metaData.user.name);
        sessionStorage.setItem('userId', loginData.metaData.metaData.user.userId);
        setTimeout(() => {
          navigate('/node');
        }, 1500);
      } catch {
        messageApi.open({
          type: 'warning',
          content: 'Đăng ký thành công! Vui lòng đăng nhập thủ công.',
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Đăng ký thất bại! Vui lòng thử lại.',
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
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>Đăng kí User</Typography.Title>
            <Input placeholder="Nhập họ và tên" ref={nameRef} />
            <Input placeholder="Nhập email" ref={emailRef} />
            <Input.Password placeholder="input password" ref={passwordRef} />
            <Button type='primary' size="large" block onClick={handleSubmit}>Đăng ký</Button>
            <Button size="medium" block onClick={() => {
              navigate('/');
            }
            }>Quay về Đăng Nhập</Button>
          </Space>
        </Card>

      </div>
    </>
  );
}

export default Register;
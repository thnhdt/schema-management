import { useNavigate } from 'react-router-dom';
import { Select, Button, message, Card, Typography, Space, Input} from 'antd';
import '../App.css'
import { useState, useEffect, useRef } from 'react';
// import { getAllUser, loginUser } from '../api/index.js';

function Main() {
  const [name, setName] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const savedName = sessionStorage.getItem('username');
    if (savedName) setName(savedName);

    const fetchUsers = async () => {
      try {
        const response = await getAllUser();
        const options = response.map(user => ({
          label: user.user,
          value: user.user,
          _id: user._id
        }));
        setUserOptions(options);
      } catch (error) {
        message.error('Lỗi khi tải danh sách user');
        console.error(error);
      }
    };

    fetchUsers();
  }, []);
  const handleSubmit = async (e) => {
    try{  
    //   e.preventDefault();

    //   const token = await loginUser(name, passwordRef.current.input.value);
    //   sessionStorage.setItem('admin', !(token.role));
    //   sessionStorage.setItem('token', token.token);
    //   sessionStorage.setItem('username', name);
    //   const selectedUser = userOptions.find(user => user.value === name);
    //   if (selectedUser) {
    //     sessionStorage.setItem('user_id', selectedUser._id);
    //   }
      navigate('/sheet');
    }catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Nhập sai mật khẩu! Vui lòng nhập lại',
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
          <Select
            size="large"
            placeholder="Chọn tên"
            value={name || undefined}
            onChange={value => setName(value)}
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              (option.label || '').toLowerCase().includes(input.toLowerCase())
            }
            options={userOptions}
          />
          <Input.Password placeholder="input password" ref={passwordRef} />
          {/* <Button type='primary' size="large" block onClick={handleSubmit} disabled={!name}>Đặt cơm</Button> */}
          <Button type='primary' size="large" block onClick={handleSubmit}>Đăng Nhập</Button>
        </Space>
      </Card>

    </div>
    </>
  );
}

export default Main;
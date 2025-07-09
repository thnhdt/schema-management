import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Card, Typography, message, Space } from 'antd';
import { resetPassword } from '../../api/user';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, contextHolder] = message.useMessage();
  const token = searchParams.get('token');

  const handleReset = async () => {
    if (!password) {
      msg.error('Vui lòng nhập mật khẩu mới!');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      msg.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      msg.error(err?.response?.data?.message || err.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      {contextHolder}
      <Card style={{ minWidth: 350 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Title level={3}>Đặt lại mật khẩu</Typography.Title>
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onPressEnter={handleReset}
          />
          <Button type="primary" block loading={loading} onClick={handleReset}>
            Xác nhận
          </Button>
        </Space>
      </Card>
    </div>
  );
} 
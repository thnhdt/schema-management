import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  message, 
  Typography, 
  Divider,
  Alert,
  Switch,
  InputNumber
} from 'antd';
import { 
  DatabaseOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { testDatabaseConnection, connectToDatabase } from '../api/schemaApi';

const { Title, Text } = Typography;
const { Password } = Input;

const DatabaseConnection = ({ onConnectionSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const connectionConfig = {
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password,
        ssl: values.ssl,
        ...(showAdvanced && {
          schema: values.schema || 'public',
          connectionTimeout: values.connectionTimeout,
          queryTimeout: values.queryTimeout,
          maxConnections: values.maxConnections
        })
      };

      const result = await testDatabaseConnection(connectionConfig);
      
      if (result.success) {
        setConnectionStatus('success');
        messageApi.success('Kết nối thành công!');
      } else {
        setConnectionStatus('error');
        messageApi.error('Kết nối thất bại: ' + result.message);
      }
    } catch (error) {
      setConnectionStatus('error');
      messageApi.error('Lỗi kết nối: ' + (error.message || 'Không thể kết nối đến database'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const connectionConfig = {
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password,
        ssl: values.ssl,
        ...(showAdvanced && {
          schema: values.schema || 'public',
          connectionTimeout: values.connectionTimeout,
          queryTimeout: values.queryTimeout,
          maxConnections: values.maxConnections
        })
      };

      const result = await connectToDatabase(connectionConfig);
      
      if (result.success) {
        // Lưu thông tin kết nối vào session storage
        sessionStorage.setItem('dbConnection', JSON.stringify(connectionConfig));
        sessionStorage.setItem('dbConnected', 'true');
        
        messageApi.success('Đã kết nối thành công đến database!');
        
        // Gọi callback để thông báo cho component cha
        if (onConnectionSuccess) {
          onConnectionSuccess(connectionConfig);
        }
      } else {
        messageApi.error('Kết nối thất bại: ' + result.message);
      }
    } catch (error) {
      messageApi.error('Lỗi kết nối: ' + (error.message || 'Không thể kết nối đến database'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('dbConnection');
    sessionStorage.removeItem('dbConnected');
    setConnectionStatus(null);
    messageApi.info('Đã ngắt kết nối database');
  };

  const isConnected = sessionStorage.getItem('dbConnected') === 'true';

  return (
    <Card 
      title={
        <Space>
          <DatabaseOutlined />
          <span>Kết Nối PostgreSQL Database</span>
        </Space>
      }
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      {contextHolder}
      
      {isConnected && (
        <Alert
          message="Đã kết nối"
          description="Database đã được kết nối thành công"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger onClick={handleDisconnect}>
              Ngắt kết nối
            </Button>
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          host: 'localhost',
          port: 5432,
          database: 'postgres',
          username: 'postgres',
          ssl: false,
          schema: 'public',
          connectionTimeout: 30000,
          queryTimeout: 30000,
          maxConnections: 10
        }}
      >
        <Form.Item
          name="host"
          label="Host"
          rules={[{ required: true, message: 'Vui lòng nhập host!' }]}
        >
          <Input placeholder="localhost" />
        </Form.Item>

        <Form.Item
          name="port"
          label="Port"
          rules={[{ required: true, message: 'Vui lòng nhập port!' }]}
        >
          <InputNumber 
            placeholder="5432" 
            min={1} 
            max={65535}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="database"
          label="Database Name"
          rules={[{ required: true, message: 'Vui lòng nhập tên database!' }]}
        >
          <Input placeholder="postgres" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
        >
          <Input placeholder="postgres" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
        >
          <Password
            placeholder="Nhập password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="ssl"
          label="SSL"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider>
          <Button 
            type="link" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ padding: 0 }}
          >
            {showAdvanced ? 'Ẩn' : 'Hiển thị'} tùy chọn nâng cao
          </Button>
        </Divider>

        {showAdvanced && (
          <>
            <Form.Item
              name="schema"
              label="Schema"
            >
              <Input placeholder="public" />
            </Form.Item>

            <Form.Item
              name="connectionTimeout"
              label="Connection Timeout (ms)"
            >
              <InputNumber 
                placeholder="30000" 
                min={1000}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="queryTimeout"
              label="Query Timeout (ms)"
            >
              <InputNumber 
                placeholder="30000" 
                min={1000}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="maxConnections"
              label="Max Connections"
            >
              <InputNumber 
                placeholder="10" 
                min={1}
                max={100}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            onClick={handleTestConnection}
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Test Kết Nối
          </Button>
          
          <Button 
            type="primary" 
            onClick={handleConnect}
            loading={loading}
            disabled={connectionStatus === 'error'}
            icon={<DatabaseOutlined />}
          >
            Kết Nối
          </Button>
        </Space>

        {connectionStatus && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            {connectionStatus === 'success' ? (
              <Text type="success">
                <CheckCircleOutlined /> Kết nối thành công
              </Text>
            ) : (
              <Text type="danger">
                <CloseCircleOutlined /> Kết nối thất bại
              </Text>
            )}
          </div>
        )}
      </Form>
    </Card>
  );
};

export default DatabaseConnection; 
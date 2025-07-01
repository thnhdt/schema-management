import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Space, Badge, Tabs, Table } from 'antd';
import {
  DatabaseOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllDatabaseInHost, connectToDatabase, disconnectToDatabase } from '../../api';
import DatabaseConnection from './DatabaseConnection';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Database = () => {
  const [activeDatabases, setActiveDatabases] = useState([]);
  const [inactiveDatabases, setInactiveDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [connectedDatabaseId, setConnectedDatabaseId] = useState(null);
  const [activeTab, setActiveTab] = useState('2');
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const nodeData = location.state?.nodeData;

  useEffect(() => {
    fetchDatabases();
  }, [id, nodeData]);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const r1 = await getAllDatabaseInHost(id, "active");
      const r2 = await getAllDatabaseInHost(id, "inactive");
      console.log(r1);
      console.log(r2);
      setActiveDatabases(r1.metaData.metaData.database);
      setInactiveDatabases(r2.metaData.metaData.database);
    } catch (error) {
      console.error('Error fetching databases:', error.message);
      messageApi.error('Lỗi khi tải danh sách database');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (record) => {
    setConnectingId(record._id);
    try {
      const response = await connectToDatabase({ id: record._id });
      console.log(response);
      setConnectedDatabaseId(record._id);
      messageApi.success(`Đã kết nối thành công đến database ${record.name}`);
      // Refresh danh sách database để cập nhật trạng thái
      await fetchDatabases();
    } catch (error) {
      console.error('Error connecting to database:', error);
      messageApi.error(`Lỗi khi kết nối database ${record.name}: ${error.message}`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (record) => {
    setDisconnectingId(record._id);
    try {
      // Debug: Kiểm tra token và userId
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userId');
      console.log('Debug disconnect - Token:', token ? 'exists' : 'missing');
      console.log('Debug disconnect - UserId:', userId);
      console.log('Debug disconnect - Database ID:', record._id);
      
      const response = await disconnectToDatabase({ id: record._id });
      setConnectedDatabaseId(null);
      messageApi.success(`Đã ngắt kết nối database ${record.name}`);
      // Refresh danh sách database để cập nhật trạng thái
      await fetchDatabases();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      messageApi.error(`Lỗi khi ngắt kết nối database ${record.name}: ${error.message}`);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleViewSchema = (record) => {
    navigate(`/schema/${record._id}`, {
      state: {
        nodeData: nodeData,
        nodeName: record.name
      }
    });
  };

  const columns = [
    {
      title: 'Tên Database',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <span>{getTypeIcon(record.type)} {text}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge status={getStatusColor(status)} text={getStatusText(status)} />
    },
  ];

  const connectColumns = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const isConnecting = connectingId === record._id;
        const isConnected = record.status === 'active';
        
        return (
          <Space>
            {!isConnected ? (
              <Button 
                type="primary" 
                onClick={() => handleConnect(record)} 
                loading={isConnecting}
                disabled={isConnecting}
              >
                Kết nối
              </Button>
            ) : (
              <Button 
                danger
                onClick={() => handleDisconnect(record)} 
                loading={disconnectingId === record._id}
                disabled={disconnectingId === record._id}
              >
                Ngắt kết nối
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const infoColumns = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            onClick={() => handleViewSchema(record)}
            disabled={record.status !== 'active'}
          >
            Xem chi tiết
          </Button>
          {record.status === 'active' ? (
            <Button 
              danger
              onClick={() => handleDisconnect(record)} 
              loading={disconnectingId === record._id}
              disabled={disconnectingId === record._id}
            >
              Ngắt kết nối
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={() => handleConnect(record)} 
              loading={connectingId === record._id}
              disabled={connectingId === record._id}
            >
              Kết nối
            </Button>
          )}
        </Space>
      )
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'connecting': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đã kết nối';
      case 'inactive': return 'Chưa kết nối';
      case 'connecting': return 'Đang kết nối';
      default: return 'Không xác định';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'postgresql': return <DatabaseOutlined style={{ color: '#336791' }} />;
      default: return <DatabaseOutlined />;
    }
  };

  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'hidden' }}>
      {contextHolder}
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/sheet')}
          >
            Quay lại Nodes
          </Button>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <DatabaseOutlined /> Database Manager
          </Title>
        </Space>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: '1',
            label: (
              <Space>
                <DatabaseOutlined />
                Kết Nối Database
              </Space>
            ),
            children: (
              <Table
                columns={connectColumns}
                dataSource={inactiveDatabases}
                rowKey="_id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Không có database nào cần kết nối.' }}
              />
            ),
          },
          {
            key: '2',
            label: (
              <Space>
                <DatabaseOutlined />
                Thông Tin Database
              </Space>
            ),
            children: (
              <Table
                columns={infoColumns}
                dataSource={activeDatabases}
                rowKey="_id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Không có database nào đang kết nối.' }}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Database;
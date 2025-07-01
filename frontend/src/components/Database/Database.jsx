import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Card, Space, Badge, Row, Col, Statistic, Tabs, Alert, Tag, Select, Table } from 'antd';
import {
  DatabaseOutlined,
  ReloadOutlined,
  SettingOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllDatabaseInHost } from '../../api';
import DatabaseConnection from './DatabaseConnection';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Dữ liệu mẫu cho database
const sampleDatabases = {
  1: {
    id: 1,
    name: 'PostgreSQL Production',
    type: 'postgresql',
    status: 'connected',
    dbStatus: [
      { name: 'production_db', status: 'active' },
      { name: 'analytics_db', status: 'active' },
      { name: 'archive_db', status: 'inactive' },
    ],
    tables: [
      { name: 'users', rows: 1250, size: '2.5 MB', lastModified: '2024-01-15 10:30:00' },
      { name: 'posts', rows: 3450, size: '8.2 MB', lastModified: '2024-01-15 11:15:00' },
      { name: 'categories', rows: 45, size: '0.1 MB', lastModified: '2024-01-14 16:20:00' },
      { name: 'comments', rows: 8900, size: '15.7 MB', lastModified: '2024-01-15 12:45:00' },
      { name: 'orders', rows: 2340, size: '5.8 MB', lastModified: '2024-01-15 09:30:00' },
      { name: 'products', rows: 567, size: '3.2 MB', lastModified: '2024-01-15 08:15:00' }
    ],
    schemas: ['public', 'auth', 'analytics', 'reports'],
    totalSize: '35.5 MB',
    connections: 12,
    uptime: '15 days'
  },
  2: {
    id: 2,
    name: 'PostgreSQL Staging',
    type: 'postgresql',
    status: 'disconnected',
    dbStatus: [],
    tables: [],
    schemas: [],
    totalSize: '0 MB',
    connections: 0,
    uptime: '0 days'
  },
};

const Database = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
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
      const response = await getAllDatabaseInHost(id);
      setDatabases(response.metaData.metaData.database);
      //  sampleDatabases
      // setDatabases(Object.values(sampleDatabases));
    } catch (error) {
      console.error('Error fetching databases:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (record) => {
    setIsConnected(true);
    messageApi.success(`Đã kết nối đến database ${record.name}`);
    // Có thể gọi API kết nối ở đây
  };

  const handleViewSchema = (record) => {
    navigate(`/schema/${record.id}`, {
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
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
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
      render: (_, record) => (
        <Button type="primary" onClick={() => handleConnect(record)} disabled={isConnected}>
          Kết nối
        </Button>
      )
    }
  ];

  const infoColumns = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleViewSchema(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  const activeDatabases = databases.filter(db => db.status === 'active');

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

  if (!databases.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Không tìm thấy database</Title>
        <Button type="primary" onClick={() => navigate('/sheet')}>
          Quay lại Nodes
        </Button>
      </div>
    );
  }

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
                dataSource={activeDatabases}
                rowKey="id"
                loading={loading}
                pagination={false}
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
                rowKey="id"
                loading={loading}
                pagination={false}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Database; 
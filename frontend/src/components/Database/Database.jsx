import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Card, Space, Badge, Row, Col, Statistic, Tabs, Alert, Tag } from 'antd';
import { 
  DatabaseOutlined, 
  ReloadOutlined,
  SettingOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

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
    tables: [],
    schemas: [],
    totalSize: '0 MB',
    connections: 0,
    uptime: '0 days'
  },
};

const Database = () => {
  const [database, setDatabase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const nodeData = location.state?.nodeData;

  useEffect(() => {
    if (id && sampleDatabases[id]) {
      const db = sampleDatabases[id];
      setDatabase(db);
      setIsConnected(db.status === 'connected');
      
      if (db.status === 'connected') {
        setActiveTab('2');
      }
    } else if (nodeData) {
      // Fallback to node data if no specific database found
      const db = {
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
        status: nodeData.status,
        tables: [],
        schemas: [],
        totalSize: '0 MB',
        connections: 0,
        uptime: '0 days'
      };
      setDatabase(db);
      setIsConnected(nodeData.status === 'connected');
      
      if (nodeData.status === 'connected') {
        setActiveTab('2');
      }
    }
  }, [id, nodeData]);

  const handleConnectionSuccess = (connectionConfig) => {
    setIsConnected(true);
    setActiveTab('2');
    // Update database status
    if (database) {
      setDatabase({
        ...database,
        status: 'connected'
      });
    }
    messageApi.success('Đã kết nối thành công đến database!');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setActiveTab('1');
    // Update database status
    if (database) {
      setDatabase({
        ...database,
        status: 'disconnected'
      });
    }
    messageApi.info('Đã ngắt kết nối database');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      messageApi.success('Đã làm mới dữ liệu!');
    }, 1000);
  };

  const handleExport = () => {
    messageApi.info('Tính năng export sẽ được phát triển sau');
  };

  const handleImport = () => {
    messageApi.info('Tính năng import sẽ được phát triển sau');
  };

  const handleViewSchema = () => {
    navigate(`/schema/${database?.id}`, { 
      state: { 
        nodeData: nodeData,
        nodeName: database?.name 
      } 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'connecting': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Đã kết nối';
      case 'disconnected': return 'Chưa kết nối';
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

  if (!database) {
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
            {getTypeIcon(database.type)} Database Manager - {database.name}
          </Title>
          <Badge 
            status={getStatusColor(database.status)} 
            text={getStatusText(database.status)} 
          />
        </Space>
      </div>

      {!isConnected && (
        <Alert
          message="Chưa kết nối database"
          description="Vui lòng kết nối đến database để bắt đầu quản lý"
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

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
              <DatabaseConnection 
                onConnectionSuccess={handleConnectionSuccess}
                onDisconnect={handleDisconnect}
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
            children: isConnected ? (
              <div>
                {/* Database Statistics */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Tổng Kích Thước"
                        value={database.totalSize}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Kết Nối Hiện Tại"
                        value={database.connections}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Uptime"
                        value={database.uptime}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Schemas"
                        value={database.schemas?.length || 0}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <Card style={{ marginBottom: 24 }}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      loading={loading}
                    >
                      Làm Mới
                    </Button>
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={handleViewSchema}
                    >
                      Xem Schema
                    </Button>
                  </Space>
                </Card>

                {/* Schemas (for PostgreSQL/MySQL) */}
                {database.type !== 'mongodb' && database.schemas && database.schemas.length > 0 && (
                  <Card title="Schemas" style={{ marginBottom: 24 }}>
                    <Space wrap>
                      {database.schemas.map(schema => (
                        <Tag key={schema} color="blue">{schema}</Tag>
                      ))}
                    </Space>
                  </Card>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary">Vui lòng kết nối database trước</Text>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Database; 
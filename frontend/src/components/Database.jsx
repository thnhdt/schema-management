import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  message, 
  Button, 
  Card, 
  Space, 
  Tag,
  Table,
  Tooltip,
  Popconfirm,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  DatabaseOutlined, 
  TableOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

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
    name: 'MySQL Development',
    type: 'mysql',
    status: 'connected',
    tables: [
      { name: 'users', rows: 89, size: '0.8 MB', lastModified: '2024-01-15 14:20:00' },
      { name: 'projects', rows: 23, size: '0.3 MB', lastModified: '2024-01-15 13:45:00' },
      { name: 'tasks', rows: 156, size: '1.2 MB', lastModified: '2024-01-15 15:10:00' }
    ],
    schemas: ['dev', 'test'],
    totalSize: '2.3 MB',
    connections: 3,
    uptime: '2 days'
  },
  3: {
    id: 3,
    name: 'PostgreSQL Staging',
    type: 'postgresql',
    status: 'disconnected',
    tables: [],
    schemas: [],
    totalSize: '0 MB',
    connections: 0,
    uptime: '0 days'
  },
  4: {
    id: 4,
    name: 'MongoDB Analytics',
    type: 'mongodb',
    status: 'connected',
    collections: [
      { name: 'user_events', documents: 1250000, size: '45.2 MB', lastModified: '2024-01-15 16:30:00' },
      { name: 'page_views', documents: 890000, size: '32.1 MB', lastModified: '2024-01-15 17:15:00' },
      { name: 'conversions', documents: 45000, size: '8.7 MB', lastModified: '2024-01-15 18:00:00' }
    ],
    totalSize: '86.0 MB',
    connections: 8,
    uptime: '7 days'
  }
};

const Database = () => {
  const [database, setDatabase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const nodeData = location.state?.nodeData;

  useEffect(() => {
    if (id && sampleDatabases[id]) {
      setDatabase(sampleDatabases[id]);
    } else if (nodeData) {
      // Fallback to node data if no specific database found
      setDatabase({
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
        status: nodeData.status,
        tables: [],
        schemas: [],
        totalSize: '0 MB',
        connections: 0,
        uptime: '0 days'
      });
    }
  }, [id, nodeData]);

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

  const handleDeleteTable = (tableName) => {
    messageApi.success(`Đã xóa bảng ${tableName}!`);
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
      case 'mysql': return <DatabaseOutlined style={{ color: '#00758F' }} />;
      case 'mongodb': return <DatabaseOutlined style={{ color: '#4DB33D' }} />;
      default: return <DatabaseOutlined />;
    }
  };

  const tableColumns = [
    {
      title: 'Tên Bảng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Số Dòng',
      dataIndex: 'rows',
      key: 'rows',
      render: (text) => text?.toLocaleString() || '0',
    },
    {
      title: 'Kích Thước',
      dataIndex: 'size',
      key: 'size',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Cập Nhật Cuối',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa bảng "${record.name}"?`}
            onConfirm={() => handleDeleteTable(record.name)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const collectionColumns = [
    {
      title: 'Tên Collection',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Số Document',
      dataIndex: 'documents',
      key: 'documents',
      render: (text) => text?.toLocaleString() || '0',
    },
    {
      title: 'Kích Thước',
      dataIndex: 'size',
      key: 'size',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Cập Nhật Cuối',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa collection "${record.name}"?`}
            onConfirm={() => handleDeleteTable(record.name)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
    <div>
      {contextHolder}
      
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <Button 
            type="text" 
            icon={<DatabaseOutlined />} 
            onClick={() => navigate('/sheet')}
          >
            ← Quay lại Nodes
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {getTypeIcon(database.type)} {database.name}
          </Title>
          <Badge 
            status={getStatusColor(database.status)} 
            text={getStatusText(database.status)} 
          />
        </Space>
      </div>

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
              title={database.type === 'mongodb' ? 'Collections' : 'Tables'}
              value={database.type === 'mongodb' ? database.collections?.length || 0 : database.tables?.length || 0}
              prefix={<TableOutlined />}
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
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            icon={<ImportOutlined />}
            onClick={handleImport}
          >
            Import
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

      {/* Tables/Collections */}
      <Card 
        title={database.type === 'mongodb' ? 'Collections' : 'Tables'}
        extra={
          <Button 
            type="primary" 
            icon={<TableOutlined />}
            size="small"
          >
            Thêm {database.type === 'mongodb' ? 'Collection' : 'Table'}
          </Button>
        }
      >
        {database.type === 'mongodb' ? (
          <Table
            columns={collectionColumns}
            dataSource={database.collections || []}
            loading={loading}
            rowKey="name"
            pagination={false}
          />
        ) : (
          <Table
            columns={tableColumns}
            dataSource={database.tables || []}
            loading={loading}
            rowKey="name"
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
};

export default Database; 
import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Button, Typography, Alert, message, Badge } from 'antd';
import { 
  DatabaseOutlined, 
  TableOutlined, 
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import SchemaFlow from './SchemaFlow';
import DatabaseConnection from '../Database/DatabaseConnection';
import { getSchemas, getTables, exportSchema, importSchema } from '../../api/index';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Dữ liệu mẫu cho schema
const sampleSchemas = {
  1: {
    id: 1,
    name: 'PostgreSQL Production',
    type: 'postgresql',
    status: 'connected',
    schemas: [
      {
        name: 'public',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'SERIAL', nullable: false, primary: true },
              { name: 'username', type: 'VARCHAR(50)', nullable: false },
              { name: 'email', type: 'VARCHAR(100)', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'NOW()' }
            ],
            foreignKeys: [
              { column: 'role_id', references: 'roles(id)' }
            ]
          },
          {
            name: 'posts',
            columns: [
              { name: 'id', type: 'SERIAL', nullable: false, primary: true },
              { name: 'title', type: 'VARCHAR(200)', nullable: false },
              { name: 'content', type: 'TEXT', nullable: true },
              { name: 'user_id', type: 'INTEGER', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'NOW()' }
            ],
            foreignKeys: [
              { column: 'user_id', references: 'users(id)' }
            ]
          },
          {
            name: 'categories',
            columns: [
              { name: 'id', type: 'SERIAL', nullable: false, primary: true },
              { name: 'name', type: 'VARCHAR(100)', nullable: false },
              { name: 'description', type: 'TEXT', nullable: true }
            ],
            foreignKeys: []
          }
        ]
      },
      {
        name: 'auth',
        tables: [
          {
            name: 'roles',
            columns: [
              { name: 'id', type: 'SERIAL', nullable: false, primary: true },
              { name: 'name', type: 'VARCHAR(50)', nullable: false },
              { name: 'permissions', type: 'JSONB', nullable: true }
            ],
            foreignKeys: []
          }
        ]
      }
    ]
  },
  2: {
    id: 2,
    name: 'MySQL Development',
    type: 'mysql',
    status: 'connected',
    schemas: [
      {
        name: 'dev',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INT AUTO_INCREMENT', nullable: false, primary: true },
              { name: 'username', type: 'VARCHAR(50)', nullable: false },
              { name: 'email', type: 'VARCHAR(100)', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
            ],
            foreignKeys: []
          },
          {
            name: 'projects',
            columns: [
              { name: 'id', type: 'INT AUTO_INCREMENT', nullable: false, primary: true },
              { name: 'name', type: 'VARCHAR(100)', nullable: false },
              { name: 'description', type: 'TEXT', nullable: true },
              { name: 'user_id', type: 'INT', nullable: false }
            ],
            foreignKeys: [
              { column: 'user_id', references: 'users(id)' }
            ]
          }
        ]
      }
    ]
  },
  3: {
    id: 3,
    name: 'PostgreSQL Staging',
    type: 'postgresql',
    status: 'disconnected',
    schemas: []
  },
  4: {
    id: 4,
    name: 'MongoDB Analytics',
    type: 'mongodb',
    status: 'connected',
    collections: [
      {
        name: 'user_events',
        fields: [
          { name: '_id', type: 'ObjectId', required: true },
          { name: 'user_id', type: 'ObjectId', required: true },
          { name: 'event_type', type: 'String', required: true },
          { name: 'timestamp', type: 'Date', required: true },
          { name: 'metadata', type: 'Object', required: false }
        ]
      },
      {
        name: 'page_views',
        fields: [
          { name: '_id', type: 'ObjectId', required: true },
          { name: 'page_url', type: 'String', required: true },
          { name: 'user_agent', type: 'String', required: false },
          { name: 'timestamp', type: 'Date', required: true }
        ]
      }
    ]
  }
};

function SchemaComponent() {
  const [activeTab, setActiveTab] = useState('1');
  const [isConnected, setIsConnected] = useState(false);
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const nodeData = location.state?.nodeData;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (id && sampleSchemas[id]) {
      const db = sampleSchemas[id];
      setDatabase(db);
      setIsConnected(db.status === 'connected');
      
      if (db.status === 'connected') {
        setSchemas(db.schemas || []);
        if (db.schemas && db.schemas.length > 0) {
          setSelectedSchema(db.schemas[0]);
          setActiveTab('2');
        }
      }
    } else if (nodeData) {
      // Fallback to node data
      setDatabase({
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
        status: nodeData.status,
        schemas: []
      });
      setIsConnected(nodeData.status === 'connected');
    }
  }, [id, nodeData]);

  const handleConnectionSuccess = (connectionConfig) => {
    setIsConnected(true);
    setActiveTab('2');
    // Load sample data based on database type
    if (database?.type === 'postgresql' || database?.type === 'mysql') {
      setSchemas(sampleSchemas[1]?.schemas || []);
      if (sampleSchemas[1]?.schemas && sampleSchemas[1].schemas.length > 0) {
        setSelectedSchema(sampleSchemas[1].schemas[0]);
      }
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSchemas([]);
    setSelectedSchema(null);
    setActiveTab('1');
  };

  const handleExportSchema = async () => {
    if (!selectedSchema) {
      messageApi.warning('Vui lòng chọn một schema để export');
      return;
    }

    try {
      setLoading(true);
      // Simulate export
      setTimeout(() => {
        messageApi.success('Export schema thành công!');
        setLoading(false);
      }, 1000);
    } catch (error) {
      messageApi.error('Export schema thất bại: ' + error.message);
      setLoading(false);
    }
  };

  const handleImportSchema = () => {
    messageApi.info('Tính năng import schema sẽ được phát triển sau');
  };

  const handleRefresh = () => {
    if (isConnected) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        messageApi.success('Đã làm mới dữ liệu!');
      }, 1000);
    }
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
            icon={<DatabaseOutlined />} 
            onClick={() => navigate('/sheet')}
          >
            ← Quay lại Nodes
          </Button>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            {getTypeIcon(database.type)} Schema Manager - {database.name}
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
          description="Vui lòng kết nối đến database để bắt đầu quản lý schema"
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
                <TableOutlined />
                Schema Flow
              </Space>
            ),
            children: isConnected ? (
              <div style={{ height: 'calc(100vh - 200px)' }}>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Text strong>Schema hiện tại: </Text>
                    <Text code>{selectedSchema?.name || 'public'}</Text>
                    {schemas.length > 0 && (
                      <select 
                        value={selectedSchema?.name || 'public'}
                        onChange={(e) => {
                          const schema = schemas.find(s => s.name === e.target.value);
                          setSelectedSchema(schema);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                      >
                        {schemas.map(schema => (
                          <option key={schema.name} value={schema.name}>
                            {schema.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {/* <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleRefresh}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                    <Button 
                      icon={<ExportOutlined />} 
                      onClick={handleExportSchema}
                      disabled={!selectedSchema}
                    >
                      Export
                    </Button>
                    <Button 
                      icon={<ImportOutlined />} 
                      onClick={handleImportSchema}
                    >
                      Import
                    </Button> */}
                  </Space>
                </div>
                
                <SchemaFlow 
                  schema={selectedSchema}
                  databaseType={database.type}
                />
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
}

export default SchemaComponent;

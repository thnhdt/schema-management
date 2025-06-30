import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Button, Typography, Alert, message, Badge, Table, Tooltip, Popconfirm, Switch, Segmented, Select } from 'antd';
import { 
  DatabaseOutlined, 
  TableOutlined, 
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FunctionOutlined,
  OrderedListOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { getSchemas, getTables, exportSchema, importSchema } from '../../api/index';
import { TableComponent } from '../../util/helper';

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
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState(null);
  const [schemaType, setSchemaType] = useState('table'); // 'table', 'function', 'sequence'
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const nodeData = location.state?.nodeData;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (id && sampleSchemas[id]) {
      const db = sampleSchemas[id];
      setDatabase(db);
      
      if (db.status === 'connected') {
        setSchemas(db.schemas || []);
        if (db.schemas && db.schemas.length > 0) {
          setSelectedSchema(db.schemas[0]);
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
    }
  }, [id, nodeData]);

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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      messageApi.success('Đã làm mới dữ liệu!');
    }, 1000);
  };

  const handleDeleteTable = (tableName) => {
    messageApi.success(`Đã xóa bảng ${tableName}!`);
  };

  const handleDeleteFunction = (functionName) => {
    messageApi.success(`Đã xóa function ${functionName}!`);
  };

  const handleDeleteSequence = (sequenceName) => {
    messageApi.success(`Đã xóa sequence ${sequenceName}!`);
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
      width: 200,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Số Cột',
      dataIndex: 'columns',
      key: 'columns',
      width: 100,
      align: 'center',
      render: (columns) => columns?.length || 0,
    },
    {
      title: 'Khóa Ngoại',
      dataIndex: 'foreignKeys',
      key: 'foreignKeys',
      width: 120,
      align: 'center',
      render: (foreignKeys) => foreignKeys?.length || 0,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
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

  const functionColumns = [
    {
      title: 'Tên Function',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Tham Số',
      dataIndex: 'parameters',
      key: 'parameters',
      width: 200,
      ellipsis: true,
      render: (parameters) => parameters?.join(', ') || 'Không có',
    },
    {
      title: 'Kiểu Trả Về',
      dataIndex: 'returnType',
      key: 'returnType',
      width: 120,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa function "${record.name}"?`}
            onConfirm={() => handleDeleteFunction(record.name)}
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

  const sequenceColumns = [
    {
      title: 'Tên Sequence',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Giá Trị Hiện Tại',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 150,
      align: 'center',
      render: (text) => text?.toLocaleString() || '0',
    },
    {
      title: 'Giá Trị Tối Đa',
      dataIndex: 'maxValue',
      key: 'maxValue',
      width: 150,
      align: 'center',
      render: (text) => text?.toLocaleString() || 'N/A',
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa sequence "${record.name}"?`}
            onConfirm={() => handleDeleteSequence(record.name)}
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
    <div style={{ padding: '0', height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
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
            {getTypeIcon(database.type)} Schema Manager - {database.name}
          </Title>
          <Badge 
            status={getStatusColor(database.status)} 
            text={getStatusText(database.status)} 
          />
        </Space>
      </div>

      {database.status !== 'connected' && (
        <Alert
          message="Database chưa được kết nối"
          description="Vui lòng kết nối database trước khi quản lý schema"
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {database.status === 'connected' ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
          {/* Schema Selection and Controls */}
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Text strong>Schema hiện tại: </Text>
                <Text code>{selectedSchema?.name || 'public'}</Text>
                {schemas.length > 0 && (
                  <Select
                    value={selectedSchema?.name || 'public'}
                    onChange={(value) => {
                      const schema = schemas.find(s => s.name === value);
                      setSelectedSchema(schema);
                    }}
                    style={{ minWidth: 120 }}
                  >
                    {schemas.map(schema => (
                      <Select.Option key={schema.name} value={schema.name}>
                        {schema.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                <Button 
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
                </Button>
                <Button 
                  type="primary"
                  icon={<DatabaseOutlined />} 
                  onClick={() => navigate('/schema/flow')}
                >
                  Schema Flow
                </Button>
              </Space>
              {/* Schema Type Segmented Control */}
              <Segmented
                options={[
                  { label: <><TableOutlined /> Table</>, value: 'table' },
                  { label: <><FunctionOutlined /> Function</>, value: 'function' },
                  { label: <><OrderedListOutlined /> Sequence</>, value: 'sequence' },
                ]}
                value={schemaType}
                onChange={setSchemaType}
                block
                style={{ maxWidth: 400 }}
              />
            </Space>
          </Card>

          {/* Schema Management */}
          <Card 
            title={
              schemaType === 'table' ? 'Quản Lý Bảng' :
              schemaType === 'function' ? 'Quản Lý Functions' :
              'Quản Lý Sequences'
            }
            extra={
              <Button 
                type="primary" 
                icon={
                  schemaType === 'table' ? <TableOutlined /> :
                  schemaType === 'function' ? <FunctionOutlined /> :
                  <OrderedListOutlined />
                }
                size="small"
              >
                Thêm {
                  schemaType === 'table' ? 'Bảng' :
                  schemaType === 'function' ? 'Function' :
                  'Sequence'
                }
              </Button>
            }
            style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0 }}
            bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}
          >
            <TableComponent
              className="schema-management-table"
              columns={
                schemaType === 'table' ? tableColumns :
                schemaType === 'function' ? functionColumns :
                sequenceColumns
              }
              data={
                schemaType === 'table' ? (selectedSchema?.tables || []) :
                schemaType === 'function' ? (selectedSchema?.functions || []) :
                (selectedSchema?.sequences || [])
              }
              loading={loading}
              rowClassName={() => ''}
              size="middle"
            />
          </Card>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">Vui lòng kết nối database trước</Text>
        </div>
      )}
    </div>
  );
}

export default SchemaComponent;

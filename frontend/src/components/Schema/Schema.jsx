import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Button, Typography, Alert, message, Badge, Tooltip, Popconfirm, Switch, Segmented, Select } from 'antd';
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
const sampleSchemas = [
  {
    name: 'public',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'SERIAL' },
          { name: 'username', type: 'VARCHAR(50)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      }
    ],
    functions: [],
    sequences: []
  },
  {
    name: 'auth',
    tables: [
      {
        name: 'roles',
        columns: [
          { name: 'id', type: 'SERIAL' },
          { name: 'name', type: 'VARCHAR(50)' },
          { name: 'permissions', type: 'JSONB' }
        ]
      }
    ],
    functions: [],
    sequences: []
  }
];

// Thêm hàm tiện ích để bổ sung columnCount cho tables
function addColumnCountToTables(schemas) {
  return schemas.map(schema => ({
    ...schema,
    tables: schema.tables
      ? schema.tables.map(table => ({
          ...table,
          columnCount: table.columns ? table.columns.length : 0
        }))
      : [],
    functions: schema.functions || [],
    sequences: schema.sequences || []
  }));
}

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
      let schemaList = db.schemas && db.schemas.length > 0 ? db.schemas : [{ name: 'public', tables: [], functions: [], sequences: [] }];
      schemaList = addColumnCountToTables(schemaList);
      setSchemas(schemaList);
      if (db.status === 'connected') {
        setSelectedSchema(schemaList[0]);
      }
    } else if (nodeData) {
      // Fallback to node data
      setDatabase({
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
        status: nodeData.status,
        schemas: [{ name: 'public', tables: [], functions: [], sequences: [] }]
      });
      setSchemas([{ name: 'public', tables: [], functions: [], sequences: [] }]);
      setSelectedSchema({ name: 'public', tables: [], functions: [], sequences: [] });
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

  const renderTables = () => {
    const columns = [
      {
        title: 'Tên Bảng',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Số Cột',
        dataIndex: 'columnCount',
        key: 'columnCount',
        render: (count) => count || 0
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/schema/${id}/table/${record.name}`)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa bảng "${record.name}"?`}
              onConfirm={() => handleDeleteTable(record.name)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <TableComponent
        title="Danh Sách Bảng"
        columns={columns}
        data={selectedSchema?.tables || []}
        loading={loading}
        customButton={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Làm Mới
            </Button>
          </Space>
        }
      />
    );
  };

  const renderFunctions = () => {
    const columns = [
      {
        title: 'Tên Function',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Tham Số',
        dataIndex: 'parameters',
        key: 'parameters',
        render: (params) => params?.join(', ') || '-'
      },
      {
        title: 'Definition',
        dataIndex: 'definition',
        key: 'definition'
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/schema/${id}/function/${record.name}`)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa function "${record.name}"?`}
              onConfirm={() => handleDeleteFunction(record.name)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <TableComponent
        title="Danh Sách Function"
        columns={columns}
        data={selectedSchema?.functions || []}
        loading={loading}
        customButton={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Làm Mới
            </Button>
          </Space>
        }
      />
    );
  };

  const renderSequences = () => {
    const columns = [
      {
        title: 'Tên Sequence',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Start Value',
        dataIndex: 'startValue',
        key: 'startValue'
      },
      {
        title: 'Bước Nhảy',
        dataIndex: 'increment',
        key: 'increment'
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/schema/${id}/sequence/${record.name}`)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa sequence "${record.name}"?`}
              onConfirm={() => handleDeleteSequence(record.name)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <TableComponent
        title="Danh Sách Sequence"
        columns={columns}
        data={selectedSchema?.sequences || []}
        loading={loading}
        customButton={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Làm Mới
            </Button>
          </Space>
        }
      />
    );
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
                <Select
                  value={selectedSchema?.name || 'public'}
                  onChange={(value) => {
                    const schema = schemas.find(s => s.name === value) || { name: value, tables: [], functions: [], sequences: [] };
                    setSelectedSchema(schema);
                  }}
                  style={{ minWidth: 120 }}
                >
                  {schemas.length > 0
                    ? schemas.map(schema => (
                        <Select.Option key={schema.name} value={schema.name}>
                          {schema.name}
                        </Select.Option>
                      ))
                    : <Select.Option value="public">public</Select.Option>
                  }
                </Select>
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
            {schemaType === 'table' ? renderTables() :
             schemaType === 'function' ? renderFunctions() :
             renderSequences()}
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

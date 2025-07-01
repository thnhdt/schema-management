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

import { TableComponent } from '../../util/helper';
import { getAllFunctions, getTables, getAllSequences } from '../../api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;


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
  const [schemas, setSchemas] = useState('public');
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState(null);
  const [schemaType, setSchemaType] = useState('table'); // 'table', 'function', 'sequence'
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [tables, setTables] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [sequences, setSequences] = useState([]);

  useEffect(() => {
    fetchAll()
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tableResponse, functionResponse, sequenceResponse] = await Promise.all([
        getTables(schemas, id),
        getAllFunctions(schemas, id),
        getAllSequences(schemas, id),
      ]);
      setTables(tableResponse.metaData.metaData.data);
      setFunctions(functionResponse.metaData.metaData.data);
      setSequences(sequenceResponse.metaData.metaData.data);
    } catch (error) {
      console.error('Error fetching databases:', error.message);
    } finally {
      setLoading(false);
    }
  }
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
        dataIndex: 'table_name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Số Cột',
        dataIndex: 'columns',
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
        data={tables || []}
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
        dataIndex: 'functionName',
        key: 'functionName',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Tham Số',
        dataIndex: 'functionArguments',
        key: 'functionArguments',
        render: (text) => <Text strong>{text}</Text>
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
        data={functions || []}
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
        dataIndex: 'sequence_name',
        key: 'sequence_name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Loại dữ liệu',
        dataIndex: 'data_type',
        key: 'data_type',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Start Value',
        dataIndex: 'start_value',
        key: 'start_value'
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
        data={sequences || []}
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

  return (
    <div style={{ padding: '0', height: 'calc(100vh - 112px)' }}>
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
          {/* <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            {getTypeIcon(database.type)} Schema Manager - {database.name}
          </Title>
          <Badge
            status={getStatusColor(database.status)}
            text={getStatusText(database.status)}
          /> */}
        </Space>
      </div>

      {/* {database.status !== 'connected' && (
        <Alert
          message="Database chưa được kết nối"
          description="Vui lòng kết nối database trước khi quản lý schema"
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )} */}

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        {/* Schema Selection and Controls */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Text strong>Schema hiện tại: </Text>
              <Text code>{selectedSchema?.name || 'public'}</Text>
              {/* <Select
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
              </Select> */}
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
          style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0, overflow: 'hidden' }}
        >
          {schemaType === 'table' ? renderTables() :
            schemaType === 'function' ? renderFunctions() :
              renderSequences()}
        </Card>
      </div>
    </div>
  );
}

export default SchemaComponent;

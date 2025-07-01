import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Button, Typography, message, Tooltip, Popconfirm, Input } from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
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
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [tables, setTables] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);

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
      }
    ];

    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ flex: 3, marginRight: 16 }}>
          <TableComponent
            title="Danh Sách Function"
            columns={columns}
            data={functions || []}
            loading={loading}
            rowKey={record => record.name}
            onRow={record => ({
              onClick: () => setSelectedFunction(record)
            })}
            rowClassName={record => selectedFunction && selectedFunction.name === record.name ? 'ant-table-row-selected' : ''}
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
        </div>
        <div style={{ flex: 2, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Text strong>Definition:</Text>
          <Input.TextArea
            style={{ width: '100%', flex: 1, fontFamily: 'monospace', fontSize: 14, minHeight: 0 }}
            value={selectedFunction ? selectedFunction.definition : ''}
            readOnly
            autoSize={false}
            rows={10}
            placeholder="Chọn một function để xem definition"
          />
        </div>
      </div>
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
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        {/* Schema Selection and Controls */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Text strong>Schema hiện tại: </Text>
              <Text code>{selectedSchema?.name || 'public'}</Text>
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
          </Space>
        </Card>

        {/* Tabs for Table, Function, Sequence */}
        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0, overflow: 'hidden' }}
        >
          <Tabs defaultActiveKey="table" style={{ height: '100%' }}>
            <Tabs.TabPane
              tab={<span><TableOutlined /> Table</span>}
              key="table"
            >
              {renderTables()}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span><FunctionOutlined /> Function</span>}
              key="function"
            >
              {renderFunctions()}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span><OrderedListOutlined /> Sequence</span>}
              key="sequence"
            >
              {renderSequences()}
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default SchemaComponent;

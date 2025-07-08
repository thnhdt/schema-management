import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Card, Space, Button, Typography, message, Tooltip, Popconfirm, Input, Row, Col, Statistic, Select, Modal } from 'antd';
import { useSelector } from 'react-redux';
import Highlighter from 'react-highlight-words';
import { store } from '../../store';
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
  ArrowLeftOutlined,
  SearchOutlined,

} from '@ant-design/icons';
import '../../App.css';
import { useNavigate, useParams } from 'react-router-dom';

import { TableComponent } from '../../util/helper';
import { getAllFunctions, getTables, getAllSequences, dropTable, dropFunction, dropSequence, getColumns, dropColumn } from '../../api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Schema() {
  const [schemas,] = useState('public');
  const [selectedSchema,] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [tables, setTables] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  const [dropColumnModal, setDropColumnModal] = useState({ visible: false, table: null, columns: [], loading: false });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const roles = useSelector(state => state.user.roles);
  const canUptdateTable = roles.some(role => role?.permissions.some(p => p.databaseId?.toString() === id && p?.ops.includes('update-table')));
  const canUptdateFunction = roles.some(role => role?.permissions.some(p => p.databaseId?.toString() === id && p?.ops.includes('update-function')));
  const isAdmin = useSelector(state => state.user.isAdmin);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => {
            var _a;
            return (_a = searchInput.current) === null || _a === void 0 ? void 0 : _a.select();
          }, 100);
        }
      },
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
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
      if (error.status === 403) {
        messageApi.open({
          key: 'expired',
          type: 'error',
          content: 'Hết phiên đăng nhập. Vui lòng đăng nhập lại!'
        });
      }
      console.error('Error fetching databases:', error.message);
    } finally {
      setLoading(false);
    }
  }
  // const handleExportSchema = async () => {
  //   if (!selectedSchema) {
  //     messageApi.warning('Vui lòng chọn một schema để export');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setTimeout(() => {
  //       messageApi.success('Export schema thành công!');
  //       setLoading(false);
  //     }, 1000);
  //   } catch (error) {
  //     messageApi.error('Export schema thất bại: ' + error.message);
  //     setLoading(false);
  //   }
  // };

  // const handleImportSchema = () => {
  //   messageApi.info('Tính năng import schema sẽ được phát triển sau');
  // };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      messageApi.success('Đã làm mới dữ liệu!');
    }, 1000);
  };
  const handleDeleteTable = async (tableName) => {
    if (!isAdmin && !canUptdateTable) {
      messageApi.error('Bạn phải là admin mới được xóa bảng!');
      return;
    }
    try {
      setLoading(true);
      await dropTable(schemas, id, tableName);
      messageApi.success(`Đã xóa bảng ${tableName}!`);
      fetchAll();
    } catch (error) {
      messageApi.error(`Xóa bảng thất bại: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFunction = async (functionName, args) => {
    if (!isAdmin && !canUptdateFunction) {
      messageApi.error('Bạn phải là admin mới được xóa function!');
      return;
    }
    try {
      setLoading(true);
      await dropFunction(schemas, id, functionName, args);
      messageApi.success(`Đã xóa function ${functionName}!`);
      fetchAll();
    } catch (error) {
      messageApi.error(`Xóa function thất bại: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSequence = async (sequenceName) => {
    if (!isAdmin) {
      messageApi.error('Bạn phải là admin mới được xóa sequence!');
      return;
    }
    try {
      setLoading(true);
      await dropSequence(schemas, id, sequenceName);
      messageApi.success(`Đã xóa sequence ${sequenceName}!`);
      fetchAll();
    } catch (error) {
      messageApi.error(`Xóa sequence thất bại: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropColumn = async (table) => {
    setDropColumnModal({ visible: true, table, columns: [], loading: true });
    try {
      const res = await getColumns(id, table.table_name, schemas);
      setDropColumnModal({ visible: true, table, columns: res.metaData.metaData.columns, loading: false });
    } catch (err) {
      messageApi.error('Bạn không có quyền truy cập trên table của database này!');
      console.error(err);
      setDropColumnModal({ visible: false, table: null, columns: [], loading: false });
    }
  };

  const handleDropColumn = async () => {
    if (!isAdmin && !canUptdateTable) {
      messageApi.error('Bạn phải là admin mới được xóa cột!');
      return;
    }
    if (!selectedColumn) return;
    setDropColumnModal(dc => ({ ...dc, loading: true }));
    try {
      await dropColumn(id, dropColumnModal.table.table_name, selectedColumn, schemas);
      messageApi.success(`Đã xóa cột ${selectedColumn}!`);
      setDropColumnModal({ visible: false, table: null, columns: [], loading: false });
      setSelectedColumn(null);
      fetchAll();
    } catch (err) {
      messageApi.error('Xóa cột thất bại!');
      console.error(err);
      setDropColumnModal(dc => ({ ...dc, loading: false }));
    }
  };

  const renderTables = () => {
    const columns = [
      Object.assign(
        {
          title: 'Tên Bảng',
          dataIndex: 'table_name',
          key: 'table_name',
          ellipsis: true,
          width: 200,
          render: (text) => <Text strong>{text}</Text>
        },
        getColumnSearchProps('table_name'),
      ),
      {
        title: 'Số Cột',
        dataIndex: 'columns',
        key: 'columnCount',
        render: (count) => count || 0,
        width: 100
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            {(isAdmin || canUptdateTable) && (
              <>
                <Popconfirm
                  title="Xác nhận xóa"
                  description={`Bạn có chắc chắn muốn xóa bảng "${record.table_name}"?`}
                  onConfirm={() => handleDeleteTable(record.table_name)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />} />
                </Popconfirm>
                <Button type="dashed" onClick={() => handleOpenDropColumn(record)}>
                  Xóa cột
                </Button>
              </>
            )}
          </Space>
        ),
        width: 180
      }
    ];
    return (
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
          rowKey={record => record.name}
          onRow={record => ({
            onClick: () => setSelectedTable(record)
          })}
          rowClassName={record => selectedTable && record.table_name === selectedTable.table_name ? 'selected-row' : 'no-hover'}
          scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
        />
      </div>
    );
  };

  const renderFunctions = () => {
    const columns = [
      Object.assign(
        {
          title: 'Tên Function',
          dataIndex: 'functionName',
          key: 'functionName',
          render: (text) => <Text strong>{text}</Text>,
          ellipsis: true,
          width: 200
        },
        getColumnSearchProps('functionName'),
      ),
      {
        title: 'Tham Số',
        dataIndex: 'functionArguments',
        key: 'functionArguments',
        render: (text) => <Text strong>{text}</Text>,
        ellipsis: true,
        width: 200
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            {(isAdmin || canUptdateFunction) && (
              <Popconfirm
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa function "${record.functionName}"?`}
                onConfirm={() => handleDeleteFunction(record.functionName, record.functionArguments)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        ),
        width: 120
      }
    ];
    return (
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <TableComponent
          title="Danh Sách Function"
          columns={columns}
          data={functions || []}
          loading={loading}
          rowKey={record => record.name}
          onRow={record => ({
            onClick: () => setSelectedFunction(record)
          })}
          rowClassName={record => selectedFunction && record.functionName === selectedFunction.functionName ? 'selected-row' : 'no-hover'}
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
          scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
        />
      </div>
    );
  };

  const renderSequences = () => {
    const columns = [
      {
        title: 'Tên Sequence',
        dataIndex: 'sequence_name',
        key: 'sequence_name',
        render: (text) => <Text strong>{text}</Text>,
        ellipsis: true,
        width: 200
      },
      {
        title: 'Loại dữ liệu',
        dataIndex: 'data_type',
        key: 'data_type',
        render: (text) => <Text strong>{text}</Text>,
        ellipsis: true,
        width: 150
      },
      {
        title: 'Start Value',
        dataIndex: 'start_value',
        key: 'start_value',
        width: 120
      },
      {
        title: 'Bước Nhảy',
        dataIndex: 'increment',
        key: 'increment',
        width: 120
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            {isAdmin && (
              <Popconfirm
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa sequence "${record.sequence_name}"?`}
                onConfirm={() => handleDeleteSequence(record.sequence_name)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        ),
        width: 120
      }
    ];
    return (
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
          rowKey={record => record.name}
          onRow={record => ({
            onClick: () => setSelectedSequence(record)
          })}
          rowClassName={record => selectedSequence && record.sequence_name === selectedSequence.sequence_name ? 'selected-row' : 'no-hover'}
          scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '0', height: '100%' }}>
      {contextHolder}

      <div style={{ marginBottom: 40 }}>
        <Space align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/node')}
          >
            Quay lại Nodes
          </Button>
        </Space>

        <Row gutter={16} style={{ marginBottom: 24 }} align="stretch">
          <Col span={8}>
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space wrap >
                  <Text strong>Schema hiện tại: </Text>
                  <Text code>{selectedSchema?.name || 'public'}</Text>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                  {/* <Button
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
                  </Button> */}
                </Space>
              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Row gutter={8}>
              <Col span={6}>
                <Card style={{ height: '100%' }}>
                  <Statistic
                    title="Schema"
                    value={selectedSchema?.name || 'public'}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ height: '100%' }}>
                  <Statistic
                    title="Số Table"
                    value={tables.length}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ height: '100%' }}>
                  <Statistic
                    title="Số Function"
                    value={functions.length}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ height: '100%' }}>
                  <Statistic
                    title="Số Sequence"
                    value={sequences.length}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2', padding: 8, maxWidth: '100%', height: '100%' }}>
          <div style={{ flex: 3, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Tabs
              activeKey={activeTab}
              onChange={key => {
                setActiveTab(key);
                setSelectedFunction(null);
                setSelectedTable(null);
                setSelectedSequence(null);
              }}
              tabBarStyle={{ marginBottom: 0 }}
            >
              <Tabs.TabPane tab={<span><TableOutlined /> Table</span>} key="table">
                {renderTables()}
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span><FunctionOutlined /> Function</span>} key="function">
                {renderFunctions()}
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span><OrderedListOutlined /> Sequence</span>} key="sequence">
                {renderSequences()}
              </Tabs.TabPane>
            </Tabs>
          </div>
          <div style={{ flex: 2, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: 16 }}>
            {activeTab === 'function' && (
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Text strong>Definition: {selectedFunction?.functionName || ''}</Text>
                <Input.TextArea
                  style={{ width: '100%', flex: 1, fontFamily: 'monospace', fontSize: 14, resize: 'none', overflow: 'auto' }}
                  value={selectedFunction ? selectedFunction.definition : ''}
                  readOnly
                  autoSize={false}
                  rows={30}
                  placeholder="Chọn một function để xem definition"
                />
              </div>
            )}
            {activeTab === 'table' && (
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Text strong>Table Info: {selectedTable?.table_name || ''}</Text>
                <Input.TextArea
                  style={{ width: '100%', flex: 1, fontFamily: 'monospace', fontSize: 14, minHeight: 0, resize: 'none' }}
                  value={selectedTable ? (selectedTable.text || 'Chưa có thông tin chi tiết cho bảng này') : ''}
                  readOnly
                  autoSize={false}
                  rows={30}
                  placeholder="Chọn một bảng để xem chi tiết"
                />
              </div>
            )}
            {activeTab === 'sequence' && (
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Text strong>Sequence Info: {selectedSequence?.sequence_name || ''}</Text>
                <Input.TextArea
                  style={{ width: '100%', flex: 1, fontFamily: 'monospace', fontSize: 14, minHeight: 0, resize: 'none' }}
                  value={selectedSequence ? (selectedSequence.text || 'Chưa có thông tin chi tiết cho sequence này') : ''}
                  readOnly
                  autoSize={false}
                  rows={30}
                  placeholder="Chọn một sequence để xem chi tiết"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={dropColumnModal.visible}
        title={`Xóa cột trong bảng ${dropColumnModal.table?.table_name || ''}`}
        onCancel={() => { setDropColumnModal({ visible: false, table: null, columns: [], loading: false }); setSelectedColumn(null); }}
        onOk={handleDropColumn}
        okButtonProps={{ disabled: !selectedColumn, loading: dropColumnModal.loading }}
        cancelButtonProps={{ disabled: dropColumnModal.loading }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn cột để xóa"
          loading={dropColumnModal.loading}
          value={selectedColumn}
          onChange={setSelectedColumn}
        >
          {dropColumnModal.columns.map(col => (
            <Select.Option key={col} value={col}>{col}</Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: 12, color: 'red' }}>
          Lưu ý: Xóa cột là thao tác không thể hoàn tác!
        </div>
      </Modal>
    </div>
  );
}

export default Schema;

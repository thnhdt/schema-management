import {
  UnorderedListOutlined,
  LoadingOutlined,
  DatabaseOutlined,
  SwapOutlined,
  BugOutlined
} from '@ant-design/icons';
import '../../App.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { getAllUpdateTables, getAllUpdateFunction, getAllLogs } from '../../api';
import { Card, List, Typography, Spin, Flex, Tag, Space, Divider, Tabs, Button, FloatButton, Modal, Checkbox } from 'antd';
import FunctionCompareComponent from '../../modules/Compare/Function';
import SequenceCompareComponent from '../../modules/Compare/Sequence';
import DrawerCompareComponent from '../../modules/Compare/Modal-Update-Ddl';
import DrawerCompareAllComponent from '../../modules/Compare/Modal-Update-All';
import CompareComponent from '../../modules/Compare/Compare';
import ModalLogComponent from '../../modules/Compare/Modal-Log';
import ModalLogErrorComponent from '../../modules/Compare/Modal-Logs-Error';
const enumTypeColor = {
  'CREATE': 'green',
  'UPDATE': 'purple',
  "DELETE": 'red'
}
const enumTypeTitle = {
  'CREATE': 'Thêm bảng',
  'UPDATE': 'Cập nhật trên bảng',
  "DELETE": 'Xóa bảng'
}
const TableListComponent = ({ updateData, selectedTables, setSelectedTables, handleGetDetailUpdate }) => {
  const allKeys = updateData.map(item => item.key);
  const allChecked = selectedTables.length === allKeys.length && allKeys.length > 0;
  const isIndeterminate = selectedTables.length > 0 && selectedTables.length < allKeys.length;
  return (
    <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto', padding: '0.5rem 0' }}>
      <div style={{ marginBottom: 8, marginLeft: 16 }}>
        <Checkbox
          indeterminate={isIndeterminate}
          checked={allChecked}
          onChange={e => {
            if (e.target.checked) {
              setSelectedTables(allKeys);
            } else {
              setSelectedTables([]);
            }
          }}
        >
          Chọn tất cả
        </Checkbox>
      </div>
      <List
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={updateData}
        scroll={{ y: 'max-content' }}
        renderItem={item => {
          const checked = selectedTables.includes(item.key);
          return (
            <List.Item
              key={item.key}
              className="hover-overlay shadow-sm rounded mb-2"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  marginLeft: '1rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedTables([...selectedTables, item.key]);
                    } else {
                      setSelectedTables(selectedTables.filter(k => k !== item.key));
                    }
                  }}
                  style={{ marginRight: 8 }}
                />
                <Tag
                  color={enumTypeColor[item.type]}
                  style={{ margin: 0, flexShrink: 0 }}
                >
                  {item.type}
                </Tag>
                <div style={{ flex: 1 }} onClick={() => handleGetDetailUpdate(item)}>
                  <List.Item.Meta
                    title={`${enumTypeTitle[item.type]} ${item.key}`}
                  />
                  <div
                    style={{
                      marginBottom: 0,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'pre-line',
                    }}
                    title={item.stmts.join('\n') || ''}
                  >
                    {item.stmts.join('\n') || ''}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};
const TableCompareComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetDatabaseId = searchParams.get('targetDatabaseId');
  const currentDatabaseId = searchParams.get('currentDatabaseId');
  const tablePrefixes = searchParams.get('tablePrefixes') ? searchParams.get('tablePrefixes').split(',') : [];
  const functionPrefixes = searchParams.get('functionPrefixes') ? searchParams.get('functionPrefixes').split(',') : [];
  const { Title, Paragraph, Text } = Typography;
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState([]);
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState(null);
  const [activeTab, setActiveTab] = useState('function');
  const [sequence, setSequence] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDrawerAll, setOpenDrawerAll] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [functionLoading, setFunctionLoading] = useState(true);
  const [functionUpdateData, setFunctionUpdateData] = useState([]);
  const [functionCurrentDatabase, setFunctionCurrentDatabase] = useState(null);
  const [functionTargetDatabase, setFunctionTargetDatabase] = useState(null);
  const [openLog, setOpenLog] = useState(false);
  const [openErrorLog, setOpenErrorLog] = useState(false);
  const [log, setLog] = useState([]);
  const [logError, setLogError] = useState('');
  const [allUpdateFunction, setAllUpdateFunction] = useState('');
  const [allUpdateDdlTable, setAllUpdateDdlTable] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const handleGetDetailUpdate = (item) => {
    let ddlPrime = '';
    let ddlSecond = '';
    let patch = '';
    let title = item.key;
    if (item.stmts) {
      ddlPrime = item.right?.text ?? '';
      ddlSecond = item.left?.text ?? '';
      patch = Array.isArray(item.stmts) ? item.stmts.join('\n') : (item.stmts ?? '');
      title = `${enumTypeTitle[item.type]} ${item.key}`;
    } else if (item.ddlPrime !== undefined || item.ddlSecond !== undefined || item.patch !== undefined) {
      ddlPrime = item.ddlPrime ?? '';
      ddlSecond = item.ddlSecond ?? '';
      patch = item.patch ?? '';
    } else if (item.ddl) {
      ddlPrime = item.ddl ?? '';
      ddlSecond = '';
      patch = item.ddl ?? '';
    }
    const detail = {
      title,
      ddlPrime,
      ddlSecond,
      patch,
      currentDatabase,
      targetDatabase
    };
    setSelectedChange(detail);
  };
  const handleBack = () => setSelectedChange(null);
  useEffect(() => {
    fetchUpdate();
    fetchFunctionUpdate();
    console.log(tablePrefixes);
    console.log(functionPrefixes);
  }, [])
  const fetchUpdate = async () => {
    try {
      const data = await getAllUpdateTables(targetDatabaseId, currentDatabaseId, tablePrefixes);
      setUpdateData(data.metaData.allUpdate);
      setCurrentDatabase(data.metaData.currentDB);
      setTargetDatabase(data.metaData.targetDB);
      setSequence(data.metaData.sequence);
      setAllUpdateDdlTable(data.metaData.updateSchema.join('\n'));
      setLog(data.metaData.log)
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false);
    }
  }
  const fetchFunctionUpdate = async () => {
    try {
      setFunctionLoading(true);
      const data = await getAllUpdateFunction(targetDatabaseId, currentDatabaseId, functionPrefixes);
      const dataLogs = await getAllLogs();
      setFunctionUpdateData(data.metaData.resultUpdate);
      setFunctionCurrentDatabase(data.metaData.currentDatabase);
      setFunctionTargetDatabase(data.metaData.targetDatabase);
      setAllUpdateFunction(data.metaData.allPatchDdl);
      setLogError(dataLogs.data);
    } catch (error) {
      console.error(error.message)
    } finally {
      setFunctionLoading(false);
    }
  }
  const hasSelected = selectedTables.length > 0 || selectedFunctions.length > 0;
  if (loading) {
    return (
      <Flex align="center"
        justify="center"
        style={{ height: '80%' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </Flex>);
  }
  return (
    <>
      <Modal
        open={!!selectedChange}
        onCancel={handleBack}
        footer={null}
        width={1000}
        style={{ top: 32 }}
      >
        {selectedChange && (
          <CompareComponent
            {...selectedChange}
            onBack={handleBack}
          />
        )}
      </Modal>
      <div style={{ maxHeight: '100vh' }}>
        <Space direction="vertical" size={2} style={{ width: '100%', marginBottom: 8 }}>
          <Title level={3} style={{ display: 'flex', alignItems: 'center' }}>
            <UnorderedListOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            Danh sách cập nhật gần đây
          </Title>

          <Text type="secondary">
            <Tag color='red'>
              <DatabaseOutlined /> Hiện tại: <strong>{currentDatabase}</strong> 
            </Tag>
            &nbsp; | &nbsp;
            <Tag color='green'>
              <DatabaseOutlined /> Đích: <strong>{targetDatabase}</strong> 
            </Tag>
          </Text>

        <Divider style={{ margin: '12px 0 0' }} />
      </Space>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button
            type="primary"
            disabled={!hasSelected}
            onClick={() => setOpenDrawer(true)}
          >
            Đồng bộ
          </Button>
        </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        tabBarExtraContent={
          <Button
            icon={<SwapOutlined />}
            className='add-btn'
            onClick={() => setOpenDrawer(true)}
          >
            Đồng bộ
          </Button>
        }
        items={[{
          key: 'function',
          label: (
            <Space>
              <DatabaseOutlined />
              Function
            </Space>
          ),
          children: (
            <FunctionCompareComponent
              loading={functionLoading}
              updateData={functionUpdateData}
              currentDatabase={functionCurrentDatabase}
              targetDatabase={functionTargetDatabase}
              onShowDetail={handleGetDetailUpdate}
              selectedFunctions={selectedFunctions}
              setSelectedFunctions={setSelectedFunctions}
            />),
        },
        {
          key: 'table',
          label: (
            <Space>
              <DatabaseOutlined />
              Table
            </Space>
          ),
          children: (
            <TableListComponent
              updateData={updateData}
              selectedTables={selectedTables}
              setSelectedTables={setSelectedTables}
              handleGetDetailUpdate={handleGetDetailUpdate}
            />)
        },
        {
          key: 'sequence',
          label: (
            <Space>
              <DatabaseOutlined />
              Sequence
            </Space>
          ),
          children: (
            <SequenceCompareComponent
              sequence={sequence}
              onShowDetail={handleGetDetailUpdate}
              currentDatabase={currentDatabase}
              targetDatabase={targetDatabase}
            />),
        },
        ]}
      />
        <DrawerCompareComponent
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          targetDatabaseId={targetDatabaseId}
          currentDatabaseId={currentDatabaseId}
          onRefetchTable={fetchUpdate}
          onRefetchFunction={fetchFunctionUpdate}
          selectedTables={selectedTables}
          selectedFunctions={selectedFunctions}
          updateData={updateData}
          functionUpdateData={functionUpdateData}
        />
        <DrawerCompareAllComponent
          open={openDrawerAll}
          onClose={() => setOpenDrawerAll(false)}
          targetDatabaseId={targetDatabaseId}
          currentDatabaseId={currentDatabaseId}
          onRefetchTable={fetchUpdate}
          onRefetchFunction={fetchFunctionUpdate}
          allUpdateFunction={allUpdateFunction}
          allUpdateDdlTable={allUpdateDdlTable}
        />
        <ModalLogComponent
        visible={openLog}
        onCancel={() => setOpenLog(false)}
        log={log}
      />
      <ModalLogErrorComponent
        visible={openErrorLog}
        onCancel={() => setOpenErrorLog(false)}
        log={logError}
      />
      <FloatButton
        style={{ insetInlineEnd: 40 }}
        className='success-btn'
        badge={{ count: log.length }}
        tooltip={'Các logs cập nhật'}
        onClick={() => setOpenLog(true)}
      />
      <FloatButton
        style={{ insetInlineEnd: 94 }}
        icon={<BugOutlined />}
        className='error-btn'
        badge={{ count: logError.split('\n').length }}
        tooltip={'Các logs lỗi'}
        onClick={() => setOpenErrorLog(true)}
      />
    </div>
    </>
  );
}

export default TableCompareComponent;

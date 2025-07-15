import {
  UnorderedListOutlined,
  LoadingOutlined,
  DatabaseOutlined,
  SwapOutlined
} from '@ant-design/icons';
import '../../App.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { getAllUpdateTables, getAllUpdateFunction } from '../../api';
import { Card, List, Typography, Spin, Flex, Tag, Space, Divider, Tabs, Button } from 'antd';
import FunctionCompareComponent from '../../modules/Compare/Function';
import SequenceCompareComponent from '../../modules/Compare/Sequence';
import DrawerCompareComponent from '../../modules/Compare/Modal-Update-Ddl';
import CompareComponent from '../../modules/Compare/Compare';
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
  const [allUpdateFunction, setAllUpdateFunction] = useState('');
  const [allUpdateDdlTable, setAllUpdateDdlTable] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [functionLoading, setFunctionLoading] = useState(true);
  const [functionUpdateData, setFunctionUpdateData] = useState([]);
  const [functionCurrentDatabase, setFunctionCurrentDatabase] = useState(null);
  const [functionTargetDatabase, setFunctionTargetDatabase] = useState(null);
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
      setFunctionUpdateData(data.metaData.resultUpdate);
      setFunctionCurrentDatabase(data.metaData.currentDatabase);
      setFunctionTargetDatabase(data.metaData.targetDatabase);
      setAllUpdateFunction(data.metaData.allPatchDdl);
    } catch (error) {
      console.error(error.message)
    } finally {
      setFunctionLoading(false);
    }
  }
  if (loading) {
    return (
      <Flex align="center"
        justify="center"
        style={{ height: '80%' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </Flex>);
  }
  if (selectedChange) {
    return (
      <CompareComponent
        {...selectedChange}
        onBack={handleBack}
      />
    );
  }
  return (
    <div style={{ maxHeight: '100vh' }}>
      <Space direction="vertical" size={2} style={{ width: '100%', marginBottom: 8 }}>
        <Title level={3} style={{ display: 'flex', alignItems: 'center' }}>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          Danh sách cập nhật gần đây
        </Title>

        <Text type="secondary">
          <DatabaseOutlined /> Đích: <strong>{targetDatabase}</strong> &nbsp;|&nbsp;
          <DatabaseOutlined /> Hiện tại: <strong>{currentDatabase}</strong>
        </Text>

        <Divider style={{ margin: '12px 0 0' }} />
      </Space>
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
              setAllUpdateFunction={setAllUpdateFunction}
              onShowDetail={handleGetDetailUpdate}
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
            <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto', padding: '0.5rem 0' }}>
              <List
                itemLayout="vertical"
                size="large"
                pagination={false}
                dataSource={updateData}
                scroll={{ y: 'max-content' }}
                renderItem={item => (
                  <List.Item
                    key={item.key}
                    onClick={() => handleGetDetailUpdate(item)}
                    className="hover-overlay shadow-sm rounded mb-2"
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                        width: '100%',
                        marginLeft: '1rem'
                      }}
                    >
                      <Tag
                        color={enumTypeColor[item.type]}
                        style={{ margin: 0, flexShrink: 0 }}
                      >
                        {item.type}
                      </Tag>

                      <div style={{ flex: 1 }}>
                        <List.Item.Meta
                          title={`${enumTypeTitle[item.type]} ${item.key}`}
                        />
                        <Paragraph
                          ellipsis={{ rows: 4 }}
                          style={{ marginBottom: 0 }}
                        >
                          {item.stmts.join('\n') || ''}
                        </Paragraph>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div >)
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
        allUpdateFunction={allUpdateFunction}
        allUpdateDdlTable={allUpdateDdlTable}
        targetDatabaseId={targetDatabaseId}
        currentDatabaseId={currentDatabaseId}
        onRefetchTable={fetchUpdate}
        onRefetchFunction={fetchFunctionUpdate}
      />
    </div>
  );
}

export default TableCompareComponent;

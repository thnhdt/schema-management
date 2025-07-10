import {
  UnorderedListOutlined,
  LoadingOutlined,
  DatabaseOutlined,
  SwapOutlined
} from '@ant-design/icons';
import '../../App.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { getAllUpdateTables } from '../../api';
import { Card, List, Typography, Spin, Flex, Tag, Space, Divider, Tabs, Button } from 'antd';
import FunctionCompareComponent from '../../modules/Compare/Function';
import SequenceCompareComponent from '../../modules/Compare/Sequence';
import DrawerCompareComponent from '../../modules/Compare/Modal-Update-Ddl';
const enumTypeColor = {
  'CREATE': 'green',
  'UPDATE': 'purple',
  "DELETE": 'red'
}
const enumTypeTitle = {
  'CREATE': 'Thêm Bảng',
  'UPDATE': 'Cập nhật trên bảng',
  "DELETE": 'Xóa bảng'
}
const TableCompareComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetDatabaseId = searchParams.get('targetDatabaseId');
  const currentDatabaseId = searchParams.get('currentDatabaseId');
  const { Title, Paragraph, Text } = Typography;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState([]);
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState(null);
  const [activeTab, setActiveTab] = useState('function');
  const [sequence, setSequence] = useState([]);
  const [allUpdateFunction, setAllUpdateFunction] = useState('');
  const [allUpdateDdlTable, setAllUpdateDdlTable] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const handleGetDetailUpdate = (key, ddlTargetTable, ddlCurrentTable, patch, currentDatabase, targetDatabase) => {
    navigate('/compare/detail', {
      state: {
        key,
        ddlPrime: ddlTargetTable,
        ddlSecond: ddlCurrentTable,
        patch,
        currentDatabase,
        targetDatabase
      }
    });
  }
  useEffect(() => {
    fetchUpdate();
  }, [])
  const fetchUpdate = async () => {
    try {
      //thêm datbase id vào
      const data = await getAllUpdateTables(targetDatabaseId, currentDatabaseId);
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
  if (loading) {
    return (
      <>
        <Flex align="center"
          justify="center"
          style={{ height: '80%' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </Flex>
      </>);
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
              targetDatabaseId={targetDatabaseId}
              currentDatabaseId={currentDatabaseId}
              setAllUpdateFunction={setAllUpdateFunction}
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
                    onClick={() => handleGetDetailUpdate(
                      `${enumTypeTitle[item.type]} ${item.key}`,
                      item.right?.text ?? '',
                      item.left?.text ?? '',
                      item.stmts.join('\n'),
                      currentDatabase,
                      targetDatabase)}
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
                          {item.stmts.join('\n')}
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
      />
    </div>

  );
}

export default TableCompareComponent;

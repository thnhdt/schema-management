import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Space, Badge, Tabs, Table } from 'antd';
import {
  DatabaseOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllDatabaseInHost, connectToDatabase, disconnectToDatabase } from '../../api';
import '../../App.css'
import ModalAddDatabase from './ModalAddDatabase';
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Database = () => {
  const [activeDatabases, setActiveDatabases] = useState([]);
  const [inactiveDatabases, setInactiveDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [activeTab, setActiveTab] = useState('2');
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const nodeData = location.state?.nodeData;
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDatabases();
  }, [id, nodeData]);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const r1 = await getAllDatabaseInHost(id, "active");
      const r2 = await getAllDatabaseInHost(id, "inactive");
      setActiveDatabases(r1.metaData.metaData.database);
      setInactiveDatabases(r2.metaData.metaData.database);
    } catch (error) {
      if (error.status === 403) {
        messageApi.open({
          key: 'expired',
          type: 'error',
          content: 'Hết phiên đăng nhập. Vui lòng đăng nhập lại!'
        });
      }
      console.error('Error fetching databases:', error.message);
      messageApi.error('Lỗi khi tải danh sách database');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (record) => {
    setConnectingId(record._id);
    try {
      await connectToDatabase({ id: record._id });
      messageApi.success(`Đã kết nối thành công đến database ${record.name}`);
      // Refresh danh sách database để cập nhật trạng thái
      await fetchDatabases();
    } catch (error) {
      console.error('Error connecting to database:', error);
      messageApi.error(`Lỗi khi kết nối database ${record.name}: ${error.message}`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (record) => {
    setDisconnectingId(record._id);
    try {
      await disconnectToDatabase({ id: record._id });
      messageApi.success(`Đã ngắt kết nối database ${record.name}`);
      await fetchDatabases();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      messageApi.error(`Lỗi khi ngắt kết nối database ${record.name}: ${error.message}`);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleViewSchema = (record) => {
    navigate(`/schema/${record._id}`, {
      state: {
        nodeData: nodeData,
        nodeName: record.name
      }
    });
  };

  const columns = [
    {
      title: 'Tên Database',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <span>{getTypeIcon(record.type)} {text}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge status={getStatusColor(status)} text={getStatusText(status)} />
    },
  ];

  const connectColumns = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const isConnecting = connectingId === record._id;
        const isConnected = record.status === 'active';

        return (
          <Space>
            {!isConnected ? (
              <Button
                type="primary"
                onClick={() => handleConnect(record)}
                loading={isConnecting}
                disabled={isConnecting}
              >
                Kết nối
              </Button>
            ) : (
              <Button
                danger
                onClick={() => handleDisconnect(record)}
                loading={disconnectingId === record._id}
                disabled={disconnectingId === record._id}
              >
                Ngắt kết nối
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const infoColumns = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => handleViewSchema(record)}
            disabled={record.status !== 'active'}
          >
            Xem chi tiết
          </Button>
          {record.status === 'active' ? (
            <Button
              danger
              onClick={() => handleDisconnect(record)}
              loading={disconnectingId === record._id}
              disabled={disconnectingId === record._id}
            >
              Ngắt kết nối
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => handleConnect(record)}
              loading={connectingId === record._id}
              disabled={connectingId === record._id}
            >
              Kết nối
            </Button>
          )}
        </Space>
      )
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'connecting': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đã kết nối';
      case 'inactive': return 'Chưa kết nối';
      case 'connecting': return 'Đang kết nối';
      default: return 'Không xác định';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'postgresql': return <DatabaseOutlined style={{ color: '#336791' }} />;
      default: return <DatabaseOutlined />;
    }
  };

  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'hidden' }}>
      {contextHolder}
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/node')}
          >
            Quay lại Nodes
          </Button>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <DatabaseOutlined /> Database Manager
          </Title>
        </Space>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setShowAddModal(true)}>
          Thêm database
        </Button>
      </Space>
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
              <Table
                columns={connectColumns}
                dataSource={inactiveDatabases}
                rowKey="_id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Không có database nào cần kết nối.' }}
                rowClassName={() => 'no-hover'}
              />
            ),
          },
          {
            key: '2',
            label: (
              <Space>
                <DatabaseOutlined />
                Thông Tin Database
              </Space>
            ),
            children: (
              <Table
                columns={infoColumns}
                dataSource={activeDatabases}
                rowKey="_id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Không có database nào đang kết nối.' }}
              />
            ),
          },
        ]}
      />
      <ModalAddDatabase
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        idNode={id}
        fetchNode={fetchDatabases}
        databases={[...activeDatabases, ...inactiveDatabases]}
        nodes={nodeData ? [nodeData] : []}
      />
    </div>
  );
};

export default Database;
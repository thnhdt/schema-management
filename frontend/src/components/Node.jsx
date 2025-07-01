import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Modal, Form, Input, Card, Space, Tag, Table, Tooltip, Popconfirm, Badge } from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllNodes } from '../api';
// import '../App.css';

const { Title, Text } = Typography;

// Dữ liệu mẫu cho PostgreSQL database nodes


const Node = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNode()
  }, []);
  const fetchNode = async () => {
    try {
      const response = await getAllNodes();
      setNodes(response.metaData.metaData.node);
    } catch (error) {
      console.error('Error fetching Sheets:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAddNode = () => {
    setEditingNode(null);
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleEditNode = (node) => {
    setEditingNode(node);
    form.setFieldsValue({
      name: node.name,
      host: node.host,
      port: node.port,
      username: node.username,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteNode = (nodeId) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    messageApi.success('Xóa node thành công!');
  };

  const handleConnectNode = (node) => {
    // Simulate connection
    const updatedNodes = nodes.map(n =>
      n.id === node.id
        ? { ...n, status: 'connected', lastConnected: new Date().toLocaleString() }
        : n
    );
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    messageApi.success(`Đã kết nối đến ${node.name}!`);
  };

  const handleDisconnectNode = (node) => {
    const updatedNodes = nodes.map(n =>
      n.id === node.id
        ? { ...n, status: 'disconnected' }
        : n
    );
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    messageApi.info(`Đã ngắt kết nối ${node.name}!`);
  };

  const onAddSubmit = (values) => {
    const newNode = {
      id: Date.now(),
      ...values,
      status: 'disconnected',
      lastConnected: null,
      tables: 0,
      schemas: 0
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    setIsAddModalVisible(false);
    form.resetFields();
    messageApi.success('Thêm node thành công!');
  };

  const onEditSubmit = (values) => {
    const updatedNodes = nodes.map(node =>
      node.id === editingNode.id
        ? { ...node, ...values }
        : node
    );
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    setIsEditModalVisible(false);
    setEditingNode(null);
    form.resetFields();
    messageApi.success('Cập nhật node thành công!');
  };

  const handleViewDatabase = (node) => {
    navigate(`/database?id=${node._id}`, {
      state: {
        nodeData: node,
        nodeName: node.name
      }
    });
  };

  const handleViewSchema = (node) => {
    navigate(`/schema?id=${node.id}`, {
      state: {
        nodeData: node,
        nodeName: node.name
      }
    });
  };


  const columns = [
    {
      title: 'Tên Node',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <DatabaseOutlined style={{ color: '#336791' }} />
          <Text strong>{text}</Text>
          <Tag color="blue">PostgreSQL</Tag>
        </Space>
      ),
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space.Compact block size='large'>
          <Tooltip title="Xem Database">
            <Button
              type="primary"

              icon={<EyeOutlined />}
              onClick={() => handleViewDatabase(record)}
            />
          </Tooltip>
          <Tooltip title="Xem Schema">
            <Button
              type="default"

              icon={<DatabaseOutlined />}
              onClick={() => handleViewSchema(record)}
            />
          </Tooltip>
          {/* {record.status === 'connected' ? (
            <Tooltip title="Ngắt kết nối">
              <Button
                type="default"
            
                icon={<CloseCircleOutlined />}
                onClick={() => handleDisconnectNode(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kết nối">
              <Button
                type="primary"
            
                icon={<CheckCircleOutlined />}
                onClick={() => handleConnectNode(record)}
              />
            </Tooltip>
          )} */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"

              icon={<EditOutlined />}
              onClick={() => handleEditNode(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa node "${record.name}"?`}
            onConfirm={() => handleDeleteNode(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger

              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space.Compact>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}

      <div style={{ marginBottom: 20 }}>
        <Title level={2}>
          <DatabaseOutlined /> PostgreSQL Database Nodes
        </Title>
        <Text type="secondary">
          Quản lý các kết nối PostgreSQL database và chuyển đổi giữa các môi trường
        </Text>
      </div>

      <Card
        title="Danh Sách PostgreSQL Nodes"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNode}
          >
            Thêm Node
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={nodes}
          loading={loading}
          rowKey="id"
          rowClassName={() => 'no-hover'}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nodes`
          }}
        />
      </Card>
      <Modal
        title="Thêm PostgreSQL Node"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={onAddSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên Node"
            rules={[{ required: true, message: 'Vui lòng nhập tên node!' }]}
          >
            <Input placeholder="Ví dụ: PostgreSQL Production" />
          </Form.Item>

          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true, message: 'Vui lòng nhập host!' }]}
          >
            <Input placeholder="localhost hoặc IP address" />
          </Form.Item>

          <Form.Item
            name="port"
            label="Port"
            rules={[{ required: true, message: 'Vui lòng nhập port!' }]}
          >
            <Input placeholder="5432" defaultValue="5432" />
          </Form.Item>

          <Form.Item
            name="database"
            label="Database Name"
            rules={[{ required: true, message: 'Vui lòng nhập tên database!' }]}
          >
            <Input placeholder="Tên database" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
          >
            <Input.TextArea placeholder="Mô tả về database node này..." rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button onClick={() => setIsAddModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh Sửa PostgreSQL Node"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={onEditSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên Node"
            rules={[{ required: true, message: 'Vui lòng nhập tên node!' }]}
          >
            <Input placeholder="Ví dụ: PostgreSQL Production" />
          </Form.Item>

          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true, message: 'Vui lòng nhập host!' }]}
          >
            <Input placeholder="localhost hoặc IP address" />
          </Form.Item>

          <Form.Item
            name="port"
            label="Port"
            rules={[{ required: true, message: 'Vui lòng nhập port!' }]}
          >
            <Input placeholder="5432" />
          </Form.Item>

          <Form.Item
            name="database"
            label="Database Name"
            rules={[{ required: true, message: 'Vui lòng nhập tên database!' }]}
          >
            <Input placeholder="Tên database" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
          >
            <Input.TextArea placeholder="Mô tả về database node này..." rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Node;

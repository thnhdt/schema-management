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
import { getAllNodes, createNode, editNode, deleteNode } from '../api';
import '../App.css';
import AddDatabaseInNode from './Database/ModalAddDatabase';
import { useGlobalUser } from '../App';

const { Title, Text } = Typography;


const Node = () => {
  const { user, setUser } = useGlobalUser();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [nodeIdAddDatabase, setNodeIdAddDatabase] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [urlString, setUrlString] = useState([]);
  const isAdmin = user ? user.roles.includes('admin') : false;

  useEffect(() => {
    console.log(user);
    fetchNode();
  }, [user]);
  const fetchNode = async (idNode = null) => {
    try {
      const response = await getAllNodes();
      setNodes(response.metaData.metaData.node);
      if (idNode) {
        const targetNode = response.metaData.metaData.node.filter(item => item._id === idNode);
        console.log(targetNode[0].databases);
        setDatabases(targetNode[0].databases);
      }
    } catch (error) {
      if (error.status === 403) {
        messageApi.open({
          key: 'expired',
          type: 'error',
          content: 'Hết phiên đăng nhập. Vui lòng đăng nhập lại!'
        });
      }
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
      password: node.password
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteNode = async (nodeId) => {
    const updatedNodes = nodes.filter(node => node._id !== nodeId);
    await deleteNode(nodeId);
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    messageApi.success('Xóa node thành công!');
  };

  const onAddSubmit = async (values) => {
    const newNode = {
      ...values,
      status: 'inactive'
    };
    await createNode(newNode);
    const updatedNodes = [newNode, ...nodes];
    setNodes(updatedNodes);
    setIsAddModalVisible(false);
    form.resetFields();
    messageApi.success('Thêm node thành công!');
  };

  const onEditSubmit = async (values) => {
    console.log(values);
    const updatedNodes = nodes.map(node =>
      node._id === editingNode._id
        ? { ...node, ...values }
        : node
    );
    await editNode(editingNode._id, values);
    setNodes(updatedNodes);
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
        <Space.Compact block size="large">
          {/* Nút luôn hiển thị */}
          <Tooltip title="Xem Database">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDatabase(record)}
            />
          </Tooltip>

          {/* Chỉ hiển thị khi isAdmin = true */}
          {isAdmin && (
            <>
              <Tooltip title="Thêm database">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setNodeIdAddDatabase(record._id);
                    setVisible(true);
                    setDatabases(record.databases);
                    setUrlString(
                      `postgres://${record.username}:${record.password}@${record.host}:${record.port}`,
                    );
                  }}
                />
              </Tooltip>

              <Tooltip title="Chỉnh sửa">
                <Button
                  color="green"
                  variant="solid"
                  icon={<EditOutlined />}
                  onClick={() => handleEditNode(record)}
                />
              </Tooltip>

              <Popconfirm
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa node "${record.name}"?`}
                onConfirm={() => handleDeleteNode(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
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
          (user ? user?.roles.includes('admin') : false) && <Button
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
          pagination={false}
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
            <Input placeholder="5432" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
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
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
          >
            <Input placeholder="Password" />
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

      <AddDatabaseInNode
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        idNode={nodeIdAddDatabase}
        databases={databases}
        urlStringDefault={urlString}
        fetchNode={fetchNode}
        nodes={nodes}
      />
    </div>
  );
};

export default Node;

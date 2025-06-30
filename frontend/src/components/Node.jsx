import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
import '../App.css';
const { Title, Text } = Typography;

// Dữ liệu mẫu cho PostgreSQL database nodes
const sampleNodes = [
  {
    id: 1,
    name: 'PostgreSQL Production',
    host: '192.168.1.100',
    port: 5432,
    database: 'production_db',
    username: 'admin',
    status: 'connected',
    description: 'Database sản xuất chính',
    lastConnected: '2024-01-15 10:30:00',
    tables: 45,
    schemas: 8
  },
  {
    id: 2,
    name: 'PostgreSQL Staging',
    host: '192.168.1.102',
    port: 5432,
    database: 'staging_db',
    username: 'staging_user',
    status: 'disconnected',
    description: 'Database staging cho testing',
    lastConnected: '2024-01-14 16:45:00',
    tables: 38,
    schemas: 6
  },
];

const Node = () => {
  const [nodes, setNodes] = useState(sampleNodes);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    // Load nodes from localStorage or API
    const savedNodes = localStorage.getItem('databaseNodes');
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes));
    } else {
      setNodes(sampleNodes);
      localStorage.setItem('databaseNodes', JSON.stringify(sampleNodes));
    }
  }, []);

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
      database: node.database,
      username: node.username,
      description: node.description
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
    navigate(`/database/${node.id}`, {
      state: {
        nodeData: node,
        nodeName: node.name
      }
    });
  };

  const handleViewSchema = (node) => {
    navigate(`/schema/${node.id}`, {
      state: {
        nodeData: node,
        nodeName: node.name
      }
    });
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
      title: 'Kết Nối',
      dataIndex: 'host',
      key: 'host',
      render: (text, record) => (
        <Text code>{text}:{record.port}</Text>
      ),
    },
    {
      title: 'Database',
      dataIndex: 'database',
      key: 'database',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Thống Kê',
      key: 'stats',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary">Tables: {record.tables || 0}</Text>
          <Text type="secondary">Schemas: {record.schemas || 0}</Text>
        </Space>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem Database">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDatabase(record)}
            />
          </Tooltip>
          <Tooltip title="Xem Schema">
            <Button
              type="default"
              size="small"
              icon={<DatabaseOutlined />}
              onClick={() => handleViewSchema(record)}
            />
          </Tooltip>
          {record.status === 'connected' ? (
            <Tooltip title="Ngắt kết nối">
              <Button
                type="default"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleDisconnectNode(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kết nối">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConnectNode(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              size="small"
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
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
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
=======
import { Typography, message, Button, Switch, Modal, Form, Input, InputNumber, Popconfirm, Flex, Checkbox, Space, Radio } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
// import { api } from '../api';
import { TableComponent } from '../util/helper';
const { Title } = Typography;
// import FormRefreshDishes from './Menu/Modal-Refresh-Dishes';
import { io } from 'socket.io-client'

const Node = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setvisible] = useState(false);
  const [editForm] = Form.useForm();
  const [category, setCategory] = useState('foods');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [addingRow, setAddingRow] = useState(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchMenuItems();
    const adminStatus = sessionStorage.getItem('admin');
    setIsAdmin(adminStatus === 'true');
  }, [category]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || '/';
    const newSocket = io(socketUrl, { transports: ['websocket'] });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);


  const handleCancelFormSheet = () => {
    setvisible(false);
  };
  const fetchMenuItems = async () => {
    try {
      const { data } = await api.post(`/menu/category`, { category: [category] });
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!socket) return;
    socket.on('update-menu-page', fetchMenuItems);
    return () => {
      socket.off('update-menu-page', fetchMenuItems);
    };
  }, [socket, category]);
  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/menu/${id}`, {
        available: !currentStatus
      });
      setMenuItems(items =>
        items.map(item =>
          item._id === id ? { ...item, available: !currentStatus } : item
        )
      );
      socket.emit('update-menu-page');
      message.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating availability:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems(items => items.filter(item => item._id !== id));
      socket.emit('update-menu-page');
      message.success('Xóa món thành công');
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Không thể xóa món');
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    editForm.setFieldsValue({ name: '', price: '', ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (_id) => {
    try {
      const row = await editForm.validateFields();
      await api.patch(`/menu/${_id}`, row);
      setEditingKey('');
      fetchMenuItems();
      socket.emit('update-menu-page');
      message.success('Cập nhật thành công');
    } catch (err) {
      message.error('Cập nhật thất bại', err.message);
    }
  };

  const handleAddNewInline = () => {
    if (addingRow) return;
    setAddingRow({
      _id: 'new',
      name: '',
      price: '',
      available: true,
      category: category,
    });
    setEditingKey('new');
    editForm.setFieldsValue({ name: '', price: '' });
  };

  const saveNew = async () => {
    try {
      const row = await editForm.validateFields();
      await api.post('/menu', {
        name: row.name,
        price: row.price,
        available: true,
        category: category,
      });
      setAddingRow(null);
      setEditingKey('');
      fetchMenuItems();
      socket.emit('update-menu-page');
      message.success('Thêm món mới thành công');
    } catch (err) {
      message.error('Không thể thêm món mới', err.message);
    }
  };

  const cancelNew = () => {
    setAddingRow(null);
    setEditingKey('');
  };

  const columns = [
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      width: '50%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="name"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}
              >
                <Input />
              </Form.Item>
            </Form>
          );
        }
        return text;
      },
    },
    {
      title: 'Giá tiền',
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="price"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập giá tiền' }]}
              >
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    style={{ width: '100%', paddingRight: '60px' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '')}
                    parser={value => value.replace(/[^\d]/g, '')}
                    min={0}
                    defaultValue={record.price}
                  />

                  <span
                    style={{
                      position: 'absolute',
                      right: '26px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#bfbfbf',
                      pointerEvents: 'none',
                    }}
                  >
                    đ
                  </span>
                </div>
              </Form.Item>
            </Form>
          );
        }
        return `${text.toLocaleString('vi-VN')} đ`;
      },
    },
  ];

  if (isAdmin) {
    columns.push(
      {
        title: 'Trạng thái',
        key: 'available',
        width: '15%',
        render: (_, record) => (
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={record.available}
            onChange={() => toggleAvailability(record._id, record.available)}
            disabled={record._id === 'new'}
          />
        ),
      },
      {
        title: 'Xóa',
        key: 'action',
        width: '15%',
        render: (_, record) => {
          if (record._id === 'new') {
            return (
              <span>
                <a onClick={saveNew} style={{ marginRight: 8 }}>Lưu</a>
                <a onClick={cancelNew}>Hủy</a>
              </span>
            );
          }
          return isEditing(record) ? (
            <span>
              <a onClick={() => save(record._id)} style={{ marginRight: 8 }}>Lưu</a>
              <a onClick={cancel}>Hủy</a>
            </span>
          ) : (
            <span>
              <Button
                icon={<EditOutlined />}
                size="small"
                type="text"
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
                style={{ marginRight: 8 }}
              />
              <Popconfirm
                title="Bạn có chắc muốn xoá món này?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <Button danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            </span>
          );
        },
      }
    );
  }

  const options = [
    { label: 'Món ăn', value: 'foods', className: 'label-1' },
    { label: 'Thức uống', value: 'drinks', className: 'label-2' },
  ];
  const onChange = e => {
    setCategory(e.target.value);
  };

  const dataSource = addingRow ? [...menuItems, addingRow] : menuItems;

  return (
    <div style={{ padding: '24px' }}>
      <TableComponent
        title={'Node'}
        customButton={
          <Space style={{ gap: '10px' }} wrap>
            <Flex style={{ float: 'right' }}>
              <Radio.Group
                value={category}
                options={options}
                onChange={onChange}
                optionType="button"
              />
            </Flex>
            {isAdmin && (
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => setvisible(true)}
              >
                Cập nhật món ăn
              </Button>
            )}
          </Space>
        }
        columns={columns}
        data={dataSource}
        loading={loading}
      />
      {isAdmin && (
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button
            type="dashed"
            shape="circle"
            icon={<PlusOutlined />}
            size="medium"
            onClick={handleAddNewInline}
            disabled={!!addingRow}
          />
        </div>
      )}
      {/* <FormRefreshDishes visible={visible} category={category} onCancel={handleCancelFormSheet} /> */}
>>>>>>> d345abb (init frontend)
    </div>
  );
};

<<<<<<< HEAD
export default Node;
=======
export default Node;
>>>>>>> d345abb (init frontend)

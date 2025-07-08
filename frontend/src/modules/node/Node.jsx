import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Card, Space, Tag, Table, Tooltip, Popconfirm, Badge, Flex } from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DiffOutlined
} from '@ant-design/icons';
import { getAllNodes, createNode, editNode, deleteNode } from '../../api';
import '../../App.css';
import AddDatabaseInNode from '../database/ModalAddDatabase';
import ModalCompareComponent from '../../components/Compare/Modal-Compare-Component';
import { store } from '../../store';

const { Title, Text } = Typography;

const Node = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [visible, setVisible] = useState(false);
  const [nodeIdAddDatabase, setNodeIdAddDatabase] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [urlString, setUrlString] = useState([]);
  const isAdmin = store.getState().user.isAdmin;
  const [openCompareFunction, setOpenCompareFunction] = useState(false);
  const canUpdateNodeAndDb = store.getState().user.roles.some(p => p?.isCreate);

  useEffect(() => {
    fetchNode();
  }, []);

  const fetchNode = async (idNode = null) => {
    try {
      const response = await getAllNodes();
      setNodes(response.metaData.metaData.node);
      if (idNode) {
        const targetNode = response.metaData.metaData.node.filter(item => item._id === idNode);
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
    setIsAddModalVisible(true);
  };

  const handleEditNode = (node) => {
    setEditingNode(node);
    setIsEditModalVisible(true);
  };

  const handleDeleteNode = async (nodeId) => {
    const updatedNodes = nodes.filter(node => node._id !== nodeId);
    await deleteNode(nodeId);
    setNodes(updatedNodes);
    localStorage.setItem('databaseNodes', JSON.stringify(updatedNodes));
    messageApi.success('Xóa node thành công!');
  };

  const onAddSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const host = form.host.value.trim();
    const port = form.port.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const database = form.database.value.trim();
    if (!name || !host || !port || !username || !password || !database) {
      messageApi.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const newNode = {
      name,
      host,
      port,
      databaseInfo: {
        username,
        password,
        database
      },
    };
    await createNode(newNode);
    const updatedNodes = [newNode, ...nodes];
    setNodes(updatedNodes);
    setIsAddModalVisible(false);
    messageApi.success('Thêm node thành công!');
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const host = form.host.value.trim();
    const port = form.port.value.trim();
    if (!name || !host || !port) {
      messageApi.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const values = { name, host, port };
    const updatedNodes = nodes.map(node =>
      node._id === editingNode._id
        ? { ...node, ...values }
        : node
    );
    await editNode(editingNode._id, values);
    setNodes(updatedNodes);
    setIsEditModalVisible(false);
    setEditingNode(null);
    messageApi.success('Cập nhật node thành công!');
  };

  // const handleViewDatabase = (node) => {
  //   navigate(`/database?id=${node._id}`, {
  //     state: {
  //       nodeData: node,
  //       nodeName: node.name
  //     }
  //   });
  // };

  const columns = [
    {
      title: 'Tên Node',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
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
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space.Compact block size="large">
          {/* <Tooltip title="Xem Database">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDatabase(record)}
            />
          </Tooltip> */}
          <Tooltip title="Thêm và xem database">
            <Button
              type="primary"
              icon={<EyeOutlined />}
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
          {(isAdmin || canUpdateNodeAndDb) && (
            <>
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
          <DatabaseOutlined /> PostgreSQL Database Instance
        </Title>
        <Text type="secondary">
          Quản lý các kết nối PostgreSQL database và chuyển đổi giữa các môi trường
        </Text>
      </div>

      <Card
        title="Danh Sách PostgreSQL Nodes"
        extra={
          <Space style={{ gap: '1rem' }}>
            {(isAdmin || canUpdateNodeAndDb) &&
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNode}
              >
                Thêm Instance
              </Button>
            }
            {/* <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenCompareFunction(true)} /> */}
            <Button
              // type="default"
              className="dark-btn"
              icon={<DiffOutlined />}
              onClick={() => setOpenCompareFunction(true)}
            >
              So sánh
            </Button>
          </Space>
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
      {isAddModalVisible && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm PostgreSQL Node</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsAddModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={onAddSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tên Node</label>
                    <input type="text" name="name" className="form-control" placeholder="Ví dụ: PostgreSQL Production" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Host</label>
                    <input type="text" name="host" className="form-control" placeholder="localhost hoặc IP address" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Port</label>
                    <input type="text" name="port" className="form-control" placeholder="5432" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" name="username" className="form-control" placeholder="Username" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" name="password" className="form-control" placeholder="Mật khẩu" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Database kết nối</label>
                    <input type="text" name="database" className="form-control" placeholder="Tên database" required />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary">Thêm</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalVisible(false)}>Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalVisible && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh Sửa PostgreSQL Instance</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsEditModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={onEditSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tên Instance</label>
                    <input type="text" name="name" className="form-control" placeholder="Ví dụ: PostgreSQL Production" required defaultValue={editingNode?.name} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Host</label>
                    <input type="text" name="host" className="form-control" placeholder="localhost hoặc IP address" required defaultValue={editingNode?.host} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Port</label>
                    <input type="text" name="port" className="form-control" placeholder="5432" required defaultValue={editingNode?.port} />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary">Cập Nhật</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalVisible(false)}>Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <ModalCompareComponent
        visible={openCompareFunction}
        onCancel={() => setOpenCompareFunction(false)}
      />
    </div>
  );
};

export default Node;

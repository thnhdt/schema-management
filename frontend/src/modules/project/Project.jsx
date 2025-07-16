import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Card, Space, Tag, Table, Tooltip, Popconfirm, Input, Form, Select } from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ProjectOutlined,
  DiffOutlined
} from '@ant-design/icons';
import { getAllNodes, createNode, editNode, getAllProject, dropProject, getAllDatabasesAll, editProject } from '../../api';
import { ModalComponent } from '../../util/helper';
import '../../App.css';
import AddDatabaseInNode from '../database/ModalAddDatabase';
import ModalCompareComponent from '../../components/Compare/Modal-Compare-Component';
import { store } from '../../store';
import CreateProject from './ModalCreateProject';

const { Title, Text } = Typography;

const Project = () => {
  const [nodes, setNodes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [visible, setVisible] = useState(false);
  const [nodeIdAddDatabase, setNodeIdAddDatabase] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [urlString, setUrlString] = useState([]);
  const isAdmin = store.getState().user.isAdmin;
  const [openCompareFunction, setOpenCompareFunction] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);
  const canUpdateNodeAndDb = store.getState().user.roles.some(p => p?.isCreate);

  useEffect(() => {
    fetchProject();
    fetchDatabases();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await getAllProject();
      setProjects(response.metaData);
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
  }
  const fetchDatabases = async () => {
    try {
      const response = await getAllDatabasesAll();
      setDatabases(response.metaData || []);
    } catch {
      message.error('Không lấy được danh sách database!');
    }
  }

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
  const isEditing = (record) => record._id === editingKey;

  const saveEdit = async (record) => {
    try {
      const values = await form.validateFields();
      await editProject({
        _id: record._id,
        updateData: {
          name: values.name,
          databaseId: values.databaseId,
          tablePrefix: values.tablePrefix,
          functionPrefix: values.functionPrefix
        }
      })
      setEditingKey('');
      form.resetFields();
      message.success('Cập nhật Project thành công');
      fetchProject();
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error('Cập nhật Project thất bại');
        console.error('Error updating project:', error);
      }
    }
  };

  const startEdit = (record) => {
    setEditingKey(record._id);
    form.setFieldsValue({
      name: record.name,
      databaseId: record.databaseId || []
    });
  };

  const cancelNew = () => {
    setEditingKey('');
    form.resetFields();
  };

  const handleEditNode = (node) => {
    setEditingNode(node);
    setIsEditModalVisible(true);
  };

  const handleDeleteProject = async (pId) => {
    const updateProject = projects.filter(project => project._id !== pId);
    await dropProject(pId);
    setProjects(updateProject);
    messageApi.success('Xóa Project thành công!');
  }

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
      title: 'Tên Project',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Form.Item
              name="name"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên Project!',
                },
              ]}
            >
              <Input placeholder="Nhập tên Project" />
            </Form.Item>
          );
        }
        return (
          <Space>
            <ProjectOutlined style={{ color: '#336791' }} />
            <Text strong>{text}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Tên Database',
      dataIndex: 'database',
      key: 'databaseId',
      width: '60%',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Form.Item
              name="databaseId"
              style={{ margin: 0 }}
            >
              <Select
                mode="multiple"
                placeholder="Chọn database"
                style={{ width: '100%' }}
              >
                {databases.map(databases => (
                  <Option key={databases._id} value={databases._id}>{databases.name}</Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return (
          <Space>
            {record.databaseId && record.databaseId.map(databaseId => {
              const dbObj = databases.find(r => r._id === databaseId);
              return (
                <Tag key={databaseId} color='blue'>
                  {dbObj?.name || databaseId}
                </Tag>
              );
            })}
          </Space>
        );
      }
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: '20%',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => saveEdit(record)}
              >
                Lưu
              </Button>
              <Button
                size="small"
                onClick={cancelNew}
              >
                Hủy
              </Button>
            </Space>
          );
        }
        return (
          <Space.Compact block size="large">
            <Tooltip title="So sánh">
              <Button
                type="primary"
                color="black"
                icon={<DiffOutlined />}
                onClick={() => setOpenCompareFunction(true)}
              />
            </Tooltip>
            <Tooltip title="Xem Project">
              <Button
                type="primary"
                icon={<EyeOutlined />}
              // onClick={() => {
              //   setNodeIdAddDatabase(record._id);
              //   setVisible(true);
              //   setDatabases(record.databases);
              //   setUrlString(
              //     `postgres://${record.username}:${record.password}@${record.host}:${record.port}`,
              //   );
              // }}
              />
            </Tooltip>
            {(isAdmin || canUpdateNodeAndDb) && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    color="green"
                    variant="solid"
                    icon={<EditOutlined />}
                    onClick={() => startEdit(record)}
                  />
                </Tooltip>

                <Popconfirm
                  title="Xác nhận xóa"
                  description={`Bạn có chắc chắn muốn xóa Project "${record.name}"?`}
                  onConfirm={() => handleDeleteProject(record._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </>
            )}
          </Space.Compact>
        );
      },
    }
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: 20 }}>
        <Title level={2}>
          <ProjectOutlined /> Project
        </Title>
        <Text type="secondary">
          Tổng hợp tất cả project
        </Text>
      </div>

      <Card
        title="Danh Sách Project"
        extra={
          <Space style={{ gap: '1rem' }}>
            <Button
              className='add-btn'
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreate(true)}
            >
              Thêm Project mới
            </Button>
          </Space>
        }
      >
        <Form form={form} component={false}>
          <Table
            columns={columns}
            dataSource={projects}
            loading={loading}
            rowKey="_id"
            rowClassName={() => 'no-hover'}
            pagination={false}
          />
        </Form>
      </Card>
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
      <CreateProject
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
        onOk={() => {
          setShowCreate(false);
          fetchProject();
        }}
      />
      {/* <UpdateProject
        visible={showUpdate}
        onCancel={() => setShowUpdate(false)}
        onOk={() => {
          setShowUpdate(false);
          fetchProject();
        }}
      /> */}
    </div >
  );
};

export default Project;

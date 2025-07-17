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
import { getAllProject, dropProject, getAllDatabasesAll, editProject } from '../../api';
import '../../App.css';
import ModalCompareProjectComponent from './Modal-Compare-Project';
import { store } from '../../store';
import CreateProject from './ModalCreateProject';
import ModalViewProjectDatabases from './ModalViewProjectDatabases';

const { Title, Text } = Typography;

//TODO: prefix + so sánh //  split(',') .....

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [databases, setDatabases] = useState([]);
  const isAdmin = store.getState().user.isAdmin;
  const [openCompareFunction, setOpenCompareFunction] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const canUpdateNodeAndDb = store.getState().user.roles.some(p => p?.isCreate);
  const [compareProjectId, setCompareProjectId] = useState(null);
  const [showViewDb, setShowViewDb] = useState(false);
  const [viewDbIds, setViewDbIds] = useState([]);

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
  const isEditing = (record) => record._id === editingKey;

  const saveEdit = async (record) => {
    try {
      const values = await form.validateFields();
      await editProject({
        _id: record._id,
        updateData: {
          name: values.name,
          databaseId: values.databaseId,
          tablePrefix: typeof values.tablePrefix === 'string' ? values.tablePrefix.split(',').filter(Boolean) : values.tablePrefix,
          functionPrefix: typeof values.functionPrefix === 'string' ? values.functionPrefix.split(',').filter(Boolean) : values.functionPrefix
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
      databaseId: record.databaseId || [],
      tablePrefix: (record.tablePrefix || []).join(','),
      functionPrefix: (record.functionPrefix || []).join(',')
    });
  };

  const cancelNew = () => {
    setEditingKey('');
    form.resetFields();
  };

  const handleDeleteProject = async (pId) => {
    const updateProject = projects.filter(project => project._id !== pId);
    await dropProject(pId);
    setProjects(updateProject);
    messageApi.success('Xóa Project thành công!');
  }

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
      width: '30%',
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
      title: 'Prefix',
      key: 'prefix',
      width: '30%',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="tablePrefix" style={{ margin: 0 }}>
                <Input placeholder="Table prefix, cách nhau bởi dấu phẩy" />
              </Form.Item>
              <Form.Item name="functionPrefix" style={{ margin: 0 }}>
                <Input placeholder="Function prefix, cách nhau bởi dấu phẩy" />
              </Form.Item>
            </Space>
          );
        }
        return (
          <Space direction="vertical">
            <div>
              <span style={{ fontWeight: 500 }}>Table: </span>
              {(record.tablePrefix || []).map((p, idx) => (
                <Tag color="blue" key={p + idx}>{p}</Tag>
              ))}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Func: </span>
              {(record.functionPrefix || []).map((p, idx) => (
                <Tag color="purple" key={p + idx}>{p}</Tag>
              ))}
            </div>
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
                onClick={() => {
                  setCompareProjectId(record._id);
                  setOpenCompareFunction(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Xem Project">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => {
                  setViewDbIds(record.databaseId || []);
                  setShowViewDb(true);
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
          Tổng hợp tất cả Project
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
      <ModalCompareProjectComponent
        visible={openCompareFunction}
        onCancel={() => setOpenCompareFunction(false)}
        projectId={compareProjectId}
      />
      <CreateProject
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
        onOk={() => {
          setShowCreate(false);
          fetchProject();
        }}
      />
      <ModalViewProjectDatabases
        visible={showViewDb}
        onCancel={() => setShowViewDb(false)}
        databaseIds={viewDbIds}
      />
    </div >
  );
};

export default Project;

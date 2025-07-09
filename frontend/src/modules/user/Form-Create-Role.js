import React, { useState, useEffect } from 'react';
import { message, Button, Popconfirm, Space, Form, Input, Select, Tag } from 'antd';
import { DeleteOutlined, UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getAllUsers, updateUser, deleteUser } from '../../api';
import { TableComponent } from '../../util/helper';
import { useSelector } from 'react-redux';

const { Option } = Select;

const Roles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [addingRow, setAddingRow] = useState(null);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  // const roles = useSelector(state => state.user.roles);
  // const isAdmin = roles.includes('admin');
  const isAdmin = useSelector(state => state.user.isAdmin);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.metaData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelNew = () => {
    setAddingRow(null);
    setEditingKey('');
    form.resetFields();
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Bạn phải là admin mới được xóa người dùng!',
      });
      console.error('Error deleting user:', error);
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const saveEdit = async (record) => {
    try {
      const values = await form.validateFields();
      await updateUser({
        _id: record._id,
        name: values.name,
        roles: values.roles
      });
      setEditingKey('');
      form.resetFields();
      message.success('Cập nhật người dùng thành công');
      fetchUsers();
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error('Cập nhật người dùng thất bại');
        console.error('Error updating user:', error);
      }
    }
  };

  const startEdit = (record) => {
    setEditingKey(record._id);
    form.setFieldsValue({
      name: record.name,
      roles: record.roles || []
    });
  };

  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      width: '60%',
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
                  message: 'Vui lòng nhập tên người dùng!',
                },
              ]}
            >
              <Input placeholder="Nhập tên người dùng" />
            </Form.Item>
          );
        }
        return (
          <Space>
            <UserOutlined />
            {text}
          </Space>
        );
      },
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: '25%',
      render: (roles, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Form.Item
              name="roles"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn ít nhất một role!',
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn roles"
                style={{ width: '100%' }}
              >
                <Option value="user">user</Option>
                <Option value="admin">admin</Option>
              </Select>
            </Form.Item>
          );
        }
        return (
          <Space>
            {roles && roles.map(role => (
              <Tag
                key={role}
                color={role === 'admin' ? 'red' : 'blue'}
              >
                {role}
              </Tag>
            ))}
          </Space>
        );
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      title: 'Thao tác',
      key: 'action',
      width: '15%',
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
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => startEdit(record)}
              disabled={!isAdmin}
            />
            <Popconfirm
              title="Bạn có chắc muốn xoá người dùng này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xoá"
              cancelText="Huỷ"
              disabled={editingKey !== '' || !isAdmin}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={editingKey !== '' || !isAdmin}
              />
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  const dataSource = addingRow ? [...users, addingRow] : users;

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <Form form={form} component={false}>
          <TableComponent
            title={'Danh Sách Người Dùng'}
            columns={columns}
            data={dataSource}
            loading={loading}
          />
        </Form>
      </div>
    </>
  );
};

export default Roles;
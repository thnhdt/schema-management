import React, { useState, useEffect } from 'react';
import { message, Button, Popconfirm, Space, Form, Input, Select, Tag } from 'antd';
import { DeleteOutlined, UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getAllUsers, updateUser, deleteUser } from '../api';
import { TableComponent } from '../util/helper';

const { Option } = Select;

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [addingRow, setAddingRow] = useState(null);
  const [editingKey, setEditingKey] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    try {
      setIsAdmin(JSON.parse(sessionStorage.getItem('roles') || '[]').includes('admin'));
    } catch {
      setIsAdmin(false);
    }
  }, [users]);
  
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.metaData);
    } catch (error) {
      if (error.status === 403) {
        messageApi.open({
          key: 'expired',
          type: 'error',
          content: 'Hết phiên đăng nhập. Vui lòng đăng nhập lại!'
        });
      }
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleAddNewInline = () => {
  //   if (addingRow) return;
  //   setAddingRow({ _id: 'new', name: '', roles: ['user'] });
  //   setEditingKey('new');
  //   form.setFieldsValue({ name: '', roles: ['user'] });
  // };

  const cancelNew = () => {
    setAddingRow(null);
    setEditingKey('');
  };

  const saveNew = async () => {
    try {
      await form.validateFields();
      setAddingRow(null);
      setEditingKey('');
      message.success('Thêm người dùng mới thành công');
    } catch (error) {
      console.error('Error adding new user:', error);
      message.error('Không thể thêm người dùng mới');
    }
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
      message.success('Cập nhật người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Cập nhật người dùng thất bại');
      console.error('Error updating user:', error);
    }
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
            <Form form={form} component={false}>
              <Form.Item
                name="name"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Form>
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
            <Form form={form} component={false}>
              <Form.Item
                name="roles"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng chọn role' }]}
              >
                <Select mode="multiple" placeholder="Chọn role">
                  <Option value="user">user</Option>
                  <Option value="admin">admin</Option>
                </Select>
              </Form.Item>
            </Form>
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
            <span>
              <a onClick={() => record._id === 'new' ? saveNew() : saveEdit(record)} style={{ marginRight: 8 }}>Lưu</a>
              <a onClick={cancelNew}>Hủy</a>
            </span>
          );
        }
        return (
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setEditingKey(record._id);
                form.setFieldsValue({
                  name: record.name,
                  roles: record.roles
                });
              }}
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
        <TableComponent
          title={'Danh Sách Người Dùng'}
          columns={columns}
          data={dataSource}
          loading={loading}
        />
        {/* {isAdmin && (
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
        )} */}
      </div>
    </>
  );
};

export default User;
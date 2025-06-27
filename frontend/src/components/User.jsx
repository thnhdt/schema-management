import React, { useState, useEffect } from 'react';
import { message, Button, Popconfirm, Space, Form, Input } from 'antd';
import { DeleteOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
// import { getAllUser, addUser, deleteUser } from '../api';
import { TableComponent } from '../util/helper';

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [addingRow, setAddingRow] = useState(null);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    const adminStatus = sessionStorage.getItem('admin');
    setIsAdmin(adminStatus === 'true');
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUser();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewInline = () => {
    if (addingRow) return;
    setAddingRow({ _id: 'new', user: '' });
    setEditingKey('new');
    form.setFieldsValue({ user: '' });
  };

  const cancelNew = () => {
    setAddingRow(null);
    setEditingKey('');
  };

  const saveNew = async () => {
    try {
      const values = await form.validateFields();
      await addUser({ user: values.user });
      setAddingRow(null);
      setEditingKey('');
      fetchUsers();
      message.success('Thêm người dùng mới thành công');
    } catch (error) {
      console.error('Error adding new user:', error);
      message.error('Không thể thêm người dùng mới');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
      message.success('Xóa người dùng thành công');
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Bạn phải là admin mới được xóa người dùng!',
      });
      console.error('Error deleting user:', error.message);
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'user',
      key: 'user',
      width: '85%',
      render: (text, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <Form form={form} component={false}>
              <Form.Item
                name="user"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
              >
                <Input />
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
  ];

  if (isAdmin) {
    columns.push({
      title: 'Xóa',
      key: 'action',
      width: '15%',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <span>
              <a onClick={saveNew} style={{ marginRight: 8 }}>Lưu</a>
              <a onClick={cancelNew}>Hủy</a>
            </span>
          );
        }
        return (
          <Popconfirm
            title="Bạn có chắc muốn xoá người dùng này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
            disabled={editingKey !== ''}
          >
            <Button danger icon={<DeleteOutlined />} disabled={editingKey !== ''} />
          </Popconfirm>
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
      </div>
    </>
  );
};

export default User;
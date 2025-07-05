import React, { useState, useEffect } from 'react';
import { message, Button, Popconfirm, Space, Form, Input, Select, Tag } from 'antd';
import { DeleteOutlined, UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getAllUsers, updateUser, deleteUser } from '../../api';
import { TableComponent } from '../../util/helper';
import { useSelector } from 'react-redux';

const { Option } = Select;

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [addingRow, setAddingRow] = useState(null);
  const [editingKey, setEditingKey] = useState('');
  const roles = useSelector(state => state.user.roles);
  const isAdmin = roles.includes('admin');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
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
      const form = document.getElementById(`edit-user-${record._id}`);
      const name = form.elements.name.value.trim();
      const roles = Array.from(form.elements.roles.selectedOptions, option => option.value);
      await updateUser({
        _id: record._id,
        name,
        roles
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
            <form id={`edit-user-${record._id}`}>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Nhập tên người dùng"
                defaultValue={record.name}
                required
              />
            </form>
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
            <form id={`edit-user-${record._id}`}>
              <select
                name="roles"
                multiple
                className="form-select"
                required
              >
                <option value="user" selected={roles && roles.includes('user')}>user</option>
                <option value="admin" selected={roles && roles.includes('admin')}>admin</option>
              </select>
            </form>
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
              <a onClick={() => saveEdit(record)} style={{ marginRight: 8 }}>Lưu</a>
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
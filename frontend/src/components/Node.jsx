import React, { useState, useEffect } from 'react';
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
    </div>
  );
};

export default Node;
import React, { useEffect, useState } from 'react';
import { Space, Button, Flex, Spin, Checkbox, Tooltip, Tag, message, Form, Input, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  LoadingOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

import { TableComponent } from '../../util/helper';
// import FormModalSheet from './Form-Modal-Sheet';
// import { getAllSheet, createSheet, updateSheet, deleteSheet, getOrdersInSheet } from '../../api';
import '../../App.css';
import { io } from "socket.io-client";


function SheetComponent() {
  const [visibleNewSheet, setvisibleNewSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chinhSua, setChinhSua] = useState();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [activeRows, setActiveRows] = useState({});
  const [category, setCategory] = useState('foods');
  const [messageApi, contextHolder] = message.useMessage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [socket, setSocket] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const adminStatus = sessionStorage.getItem('admin');
    setIsAdmin(adminStatus === 'true');
  }, []);
  const fetchSheet = async () => {
    try {
      const response = await getAllSheet(category);
      setData(response.data);
      const initialActiveRows = {};
      response.data.forEach(item => {
        initialActiveRows[item._id] = item.status;
      });
      setActiveRows(initialActiveRows);
    } catch (error) {
      console.error('Error fetching Sheets:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
  }, [category])

  const onCreate = async (values) => {
    try {
      const value = { ...values };
      await createSheet(value);
      setCategory(values.category[0]);
    } catch (error) {
      console.error('Error create sheet:', error.message);
    } finally {
      setvisibleNewSheet(false);
      setChinhSua(null);
      socket.emit('update-sheet');
    }
  };

  const onUpdate = async (values) => {
    try {
      const { _id, ...updateData } = values;
      await updateSheet({ id: _id, ...updateData });
    } catch (error) {
      console.error('Error create sheet:', error.message);
    } finally {
      setvisibleNewSheet(false);
      setChinhSua(null);
      socket.emit('update-sheet');
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteSheet(record._id);
      socket.emit('update-sheet');
    }
    catch (error) {
      console.error('Error delete sheet:', error.message);
    }
  }

  const handleCancelFormSheet = () => {
    setvisibleNewSheet(false);
    setChinhSua(null);
  };

  const handleToggleActive = async (record) => {
    try {
      if (activeRows[record._id] === 'Active') {
        const response = await getOrdersInSheet(record._id);
        const orders = response.data || [];
        const allPaid = orders.length === 0 || (orders.length > 0 && orders.every(order => order.paid));
        const newStatus = allPaid ? 'Done' : 'Ongoing';
        await updateSheet({ id: record._id, status: newStatus });
        setActiveRows((prev) => ({
          ...prev,
          [record._id]: newStatus
        }));
      } else {
        await updateSheet({ id: record._id, status: 'Active' });
        setActiveRows((prev) => ({
          ...prev,
          [record._id]: 'Active'
        }));
      }
      socket.emit('update-sheet');
    } catch (error) {
      if (error.status === 401) {
        messageApi.open({
          type: 'error',
          content: 'Bạn phải là admin mới được chỉnh sửa!',
        });
      }
      console.error('Error updating sheet status:', error.message);
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ date: '', note: '', ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      await updateSheet({ id: id, ...row });
      setEditingKey('');
      const response = await getAllSheet(category);
      setData(response.data);
      socket.emit('update-sheet');
      message.success('Cập nhật thành công');
    } catch (err) {
      message.error('Cập nhật thất bại', err.message);
    }
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || '/';
    const newSocket = io(socketUrl, { transports: ['websocket'] });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('update-sheet', fetchSheet);
    return () => {
      socket.off('update-sheet', fetchSheet);
    };
  }, [socket, category]);

  const columns = [
    {
      title: <div style={{ textAlign: 'center' }}>Tên người đặt</div>,
      dataIndex: 'user',
      width: '15%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>Tiêu đề </div>,
      dataIndex: 'date',
      width: '30%',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form form={form} component={false}>
            <Form.Item
              name="date"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : (
          text
        );
      }
    },
    {
      title: <div style={{ textAlign: 'center' }}>Ghi chú</div>,
      dataIndex: 'note',
      width: '20%',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form form={form} component={false}>
            <Form.Item
              name="note"
              style={{ margin: 0 }}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : (
          text
        );
      }
    },
    {
      title: <div style={{ textAlign: 'center' }}>Trạng Thái</div>,
      key: 'action',
      render: (_, record) => (
        <Space.Compact block size="middle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            type={activeRows[record._id] === 'Active' ? 'primary' : 'default'}
            onClick={() => { isAdmin && handleToggleActive(record) }}
          >
            {activeRows[record._id] === 'Active' ? 'Đang đặt' : (activeRows[record._id] || 'Active')}
          </Button>
        </Space.Compact>
      ),
      width: '20%'
    },
    {
      title: <div style={{ textAlign: 'center' }}>Action</div>,
      key: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <Space.Compact block size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {editable ? (
              <span>
                <a onClick={() => save(record._id)} style={{ marginRight: 8 }}>Lưu</a>
                <a onClick={cancel}>Hủy</a>
              </span>
            ) : (
              <>
                {isAdmin && (
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      style={{ backgroundColor: '#32CD32' }}
                      disabled={editingKey !== ''}
                      onClick={() => edit(record)}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Chi tiết">
                  <Button type="primary"
                    icon={<UnorderedListOutlined />}
                    onClick={() => {
                      navigate(`/sheet/detail?id=${record?._id}`, {
                        state: {
                          userData: { date: record?.date, menus: record?.menus, status: record?.status }
                        }
                      });
                    }}
                  />
                </Tooltip>
                {isAdmin && (
                  <Tooltip title="Xóa">
                    <Button danger type="primary" onClick={() => handleDelete(record)} icon={<DeleteOutlined />} />
                  </Tooltip>
                )}
              </>
            )}
          </Space.Compact>
        );
      },
      width: '15%'
    },
  ];
  const options = [
    { label: 'Món ăn', value: 'foods', className: 'label-1' },
    { label: 'Thức uống', value: 'drinks', className: 'label-2' },
  ];
  const onChange = e => {
    setCategory(e.target.value);
  };
  if (loading)
    return (
      <>
        {contextHolder}
        <Flex align="center"
          justify="center"
          style={{ height: '80%' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </Flex>
      </>);
  return (
    <>
      {contextHolder}
      <TableComponent
        title={'Bảng đặt cơm'}
        customButton={
          <Space style={{ gap: '10px' }} wrap>
            <Space style={{ gap: '10px', float: 'right' }} wrap>
              <Radio.Group
                value={category}
                options={options}
                onChange={onChange}
                optionType="button"
              />
            </Space>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setvisibleNewSheet(true)}
              >
                Tạo sheet đặt
              </Button>
            )}
          </Space>
        }
        columns={columns}
        loading={loading}
        data={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => {
          const status = activeRows[record._id];
          if (status === 'Active') return 'active-row';
          if (status === 'Ongoing') return 'notdone-row';
          return 'inactive-row';
        }}
      />
    </>
  );
}

export default SheetComponent;

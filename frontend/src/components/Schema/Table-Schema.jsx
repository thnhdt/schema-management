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
import '../../App.css';
import { io } from "socket.io-client";


function SchemaComponent() {

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [activeRows, setActiveRows] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [isAdmin, setIsAdmin] = useState(false);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const adminStatus = sessionStorage.getItem('admin');
    setIsAdmin(adminStatus === 'true');
  }, []);

//   const fetchSheet = async () => {
//     try {
//       const response = await getAllSheet(category);
//       setData(response.data);
//       const initialActiveRows = {};
//       response.data.forEach(item => {
//         initialActiveRows[item._id] = item.status;
//       });
//       setActiveRows(initialActiveRows);
//     } catch (error) {
//       console.error('Error fetching Sheets:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSheet();
//   }, [category])

// Add Socket
//   useEffect(() => {
//     const socketUrl = import.meta.env.VITE_BACKEND_URL || '/';
//     const newSocket = io(socketUrl, { transports: ['websocket'] });
//     setSocket(newSocket);
//     return () => newSocket.close();
//   }, []);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on('update-sheet', fetchSheet);
//     return () => {
//       socket.off('update-sheet', fetchSheet);
//     };
//   }, [socket, category]);

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
                      navigate(`/node/detail?id=${record?._id}`, {
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

//   if (loading)
//     return (
//       <>
//         {contextHolder}
//         <Flex align="center"
//           justify="center"
//           style={{ height: '80%' }}>
//           <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
//         </Flex>
//       </>);
  return (
    <>
      {contextHolder}

      <TableComponent
        title={'Schema'}
        columns={columns}
        loading={loading}
        data={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        // rowClassName={(record) => {
        //   const status = activeRows[record._id];
        //   if (status === 'Active') return 'active-row';
        //   if (status === 'Ongoing') return 'notdone-row';
        //   return 'inactive-row';
        // }}
      />
    </>
  );
}

export default SchemaComponent;

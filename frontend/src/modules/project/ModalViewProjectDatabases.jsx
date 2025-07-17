import React, { useEffect, useState } from "react";
import { message, Button, Tooltip, Modal } from "antd";
import { useNavigate } from 'react-router-dom';
import { getAllDatabasesAll, editDatabase } from '../../api/database';
import { getAllNodes } from '../../api/node';
import { TableComponent } from '../../util/helper';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';

const ModalViewProjectDatabases = ({ visible, onCancel, databaseIds }) => {
  const [databases, setDatabases] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [editingRowData, setEditingRowData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (visible && Array.isArray(databaseIds) && databaseIds.length > 0) {
      fetchDatabases();
      fetchNodes();
    } else {
      setDatabases([]);
      setNodes([]);
    }
    // eslint-disable-next-line
  }, [visible, databaseIds]);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const res = await getAllDatabasesAll();
      const allDbs = res.metaData || [];
      const filtered = allDbs.filter(db => databaseIds.includes(db._id));
      setDatabases(filtered);
    } catch {
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNodes = async () => {
    try {
      const res = await getAllNodes();
      setNodes(res.metaData?.metaData?.node || []);
    } catch {
      setNodes([]);
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    setEditingKey(record._id);
    setEditingRowData({
      name: record.name,
      database: record.database,
      username: record.username,
    });
  };

  const cancel = () => {
    setEditingKey('');
    setEditingRowData(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRowData(prev => ({ ...prev, [name]: value }));
  };

  const save = async (_id) => {
    try {
      const data = {
        name: editingRowData.name.trim(),
        database: editingRowData.database.trim(),
        username: editingRowData.username.trim(),
      };
      await editDatabase(_id, data);
      await fetchDatabases();
      setEditingKey('');
      setEditingRowData(null);
      message.success('Cập nhật thành công');
    } catch (err) {
      message.error('Cập nhật thất bại', err.message);
    }
  };

  const handleViewSchema = (record) => {
    navigate(`/schema/${record._id}`);
  };

  const getNodeInfo = (nodeId) => {
    const node = nodes.find(n => n._id === nodeId);
    return node ? { host: node.host, port: node.port } : { host: '', port: '' };
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <input type="text" name="name" className="form-control" placeholder="Tên database" required value={editingRowData?.name || ''} onChange={handleEditInputChange} style={{ borderRadius: 6, border: '1px solid #d9d9d9', padding: 4 }} />
          );
        }
        return <span style={{ fontWeight: 500 }}>{text}</span>;
      },
    },
    {
      title: 'Tên DB',
      dataIndex: 'database',
      key: 'database',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <input type="text" name="database" className="form-control" placeholder="Tên DB" required value={editingRowData?.database || ''} onChange={handleEditInputChange} style={{ borderRadius: 6, border: '1px solid #d9d9d9', padding: 4 }} />
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <input type="text" name="username" className="form-control" placeholder="Username" required value={editingRowData?.username || ''} onChange={handleEditInputChange} style={{ borderRadius: 6, border: '1px solid #d9d9d9', padding: 4 }} />
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      render: (_, record) => <span style={{ color: '#336791', fontWeight: 500 }}>{getNodeInfo(record.nodeId).host || ''}</span>,
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      render: (_, record) => <span style={{ color: '#336791', fontWeight: 500 }}>{getNodeInfo(record.nodeId).port || ''}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        return isEditing(record) ? (
          <span>
            <a onClick={() => save(record._id)} style={{ marginRight: 8, color: '#52c41a', fontWeight: 500 }}>Lưu</a>
            <a onClick={cancel} style={{ color: '#f5222d', fontWeight: 500 }}>Hủy</a>
          </span>
        ) : (
          <span>
            <Button
              icon={<EditOutlined />}
              size="small"
              type="text"
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              style={{ marginRight: 8, color: '#1890ff', border: '1px solid #e6f7ff', background: '#f0faff', borderRadius: 6 }}
            />
            <Tooltip title="Xem chi tiết">
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleViewSchema(record)}
                size="small"
                style={{ color: '#722ed1', border: '1px solid #f3e8ff', background: '#faf7ff', borderRadius: 6 }}
              />
            </Tooltip>
          </span>
        );
      },
    },
  ];

  return (
    <Modal
      open={visible}
      title="Danh sách Database của Project"
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ borderRadius: 16 }}
      bodyStyle={{ padding: 24, background: '#f8fafc', borderRadius: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <TableComponent
          columns={columns}
          data={databases}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </div>
    </Modal>
  );
};

export default ModalViewProjectDatabases; 
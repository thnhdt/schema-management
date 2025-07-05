import React, { useState, useRef } from "react";
import { Modal, message, Spin, Button, Switch, Popconfirm, Input, InputNumber } from "antd";
import { useSelector } from "react-redux";
import { editDatabase, createDatabase, deleteDatabase } from "../../api";
import { ModalComponent, TableComponent } from "../../util/helper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

const AddDatabaseInNode = (props) => {
  const { visible, onCancel, idNode, onOk, databases, fetchNode } = props;
  const [editingKey, setEditingKey] = useState('');
  const [addingRow, setAddingRow] = useState(null);
  const addNameRef = useRef();
  const addDatabaseRef = useRef();
  const addUsernameRef = useRef();
  const addPasswordRef = useRef();
  
  const roles = useSelector(state => state.user.roles);
  const isAdmin = roles.includes('admin');

  const handleDelete = async (id) => {
    if (!isAdmin) {
      message.error('Bạn phải là admin mới được xóa database!');
      return;
    }
    try {
      await deleteDatabase(id);
      await fetchNode(idNode);
      message.success('Xóa database thành công');
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Không thể xóa database');
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    if (!isAdmin) {
      message.error('Bạn phải là admin mới được chỉnh sửa database!');
      return;
    }
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (_id) => {
    if (!isAdmin) {
      message.error('Bạn phải là admin mới được chỉnh sửa database!');
      return;
    }
    try {
      const row = document.getElementById(`edit-row-${_id}`);
      const data = {
        name: row.elements.name.value.trim(),
        database: row.elements.database.value.trim(),
        username: row.elements.username.value.trim(),
        password: row.elements.password.value.trim(),
      };
      await editDatabase(_id, data);
      await fetchNode(idNode);
      setEditingKey('');
      message.success('Cập nhật thành công');
    } catch (err) {
      message.error('Cập nhật thất bại', err.message);
    }
  };

  const handleAddNewInline = () => {
    if (!isAdmin) {
      message.error('Bạn phải là admin mới được thêm database!');
      return;
    }
    if (addingRow) return;
    setAddingRow({ _id: 'new' });
    setEditingKey('new');
  };

  const saveNew = async () => {
    if (!isAdmin) {
      message.error('Bạn phải là admin mới được thêm database!');
      return;
    }
    try {
      const createdData = {
        name: addNameRef.current.value.trim(),
        database: addDatabaseRef.current.value.trim(),
        username: addUsernameRef.current.value.trim(),
        password: addPasswordRef.current.value.trim(),
        nodeId: idNode
      };
      await createDatabase(createdData);
      await fetchNode(idNode);
      setAddingRow(null);
      setEditingKey('');
      message.success('Thêm database mới thành công');
    } catch (err) {
      message.error('Không thể thêm database mới', err.message);
    }
  };

  const cancelNew = () => {
    setAddingRow(null);
    setEditingKey('');
  };

  const columns = [
    {
      title: 'Tên Database',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new') {
          return (
            <input type="text" name="name" className="form-control" placeholder="Tên database" required ref={addNameRef} />
          );
        }
        if (isEditing(record)) {
          return (
            <form id={`edit-row-${record._id}`}>
              <input type="text" name="name" className="form-control" placeholder="Tên database" required defaultValue={record.name} />
            </form>
          );
        }
        return text;
      },
    },
    {
      title: 'Tên DB (database)',
      dataIndex: 'database',
      key: 'database',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new') {
          return (
            <input type="text" name="database" className="form-control" placeholder="Tên DB" required ref={addDatabaseRef} />
          );
        }
        if (isEditing(record)) {
          return (
            <form id={`edit-row-${record._id}`}>
              <input type="text" name="database" className="form-control" placeholder="Tên DB" required defaultValue={record.database} />
            </form>
          );
        }
        return text;
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new') {
          return (
            <input type="text" name="username" className="form-control" placeholder="Username" required ref={addUsernameRef} />
          );
        }
        if (isEditing(record)) {
          return (
            <form id={`edit-row-${record._id}`}>
              <input type="text" name="username" className="form-control" placeholder="Username" required defaultValue={record.username} />
            </form>
          );
        }
        return text;
      },
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      width: '20%',
      editable: false,
      render: (text, record) => {
        if (record._id === 'new') {
          return (
            <input type="password" name="password" className="form-control" placeholder="Password" required ref={addPasswordRef} />
          );
        }
        if (isEditing(record)) {
          return (
            <form id={`edit-row-${record._id}`}>
              <input type="password" name="password" className="form-control" placeholder="Password" required defaultValue={record.password} />
            </form>
          );
        }
        return <span>******</span>;
      },
    },
  ];

  columns.push({
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
          {isAdmin && (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                type="text"
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
                style={{ marginRight: 8 }}
              />
              <Popconfirm
                title="Bạn có chắc muốn xoá database này?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <Button danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            </>
          )}
        </span>
      );
    },
  });

  const dataSource = addingRow ? [...databases, addingRow] : databases;

  return (
    <ModalComponent
      onCancel={onCancel}
      width={'60%'}
      onOk={onOk}
      open={visible}
      title={'Thêm Database'}
      okText={'Đóng'}
      Component={(
        <div style={{ padding: '24px' }}>
          <TableComponent
            title={'Database'}
            customButton={undefined}
            columns={columns}
            data={dataSource}
            loading={false}
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
      )}
    />
  );
};

export default AddDatabaseInNode
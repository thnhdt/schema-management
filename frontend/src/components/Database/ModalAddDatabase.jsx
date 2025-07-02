import React, { useState } from "react";
import { Modal, message, Spin, Button, Switch, Form, Popconfirm, Input, InputNumber } from "antd";
import { editDatabase, createDatabase, deleteDatabase } from "../../api";
import { ModalComponent, TableComponent } from "../../util/helper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

const AddDatabaseInNode = (props) => {
  const { visible, onCancel, idNode, onOk, databases, fetchNode } = props;
  const [editForm] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [addingRow, setAddingRow] = useState(null);

  const handleDelete = async (id) => {
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
    editForm.setFieldsValue({ name: '', database: '', username: '', password: '', ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (_id) => {
    try {
      const row = await editForm.validateFields();
      await editDatabase(_id, row);
      await fetchNode(idNode);
      setEditingKey('');
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
      database: '',
      username: '',
      password: ''
    });
    setEditingKey('new');
    editForm.setFieldsValue({ name: '', database: '', username: '', password: '' });
  };

  const saveNew = async () => {
    try {
      const row = await editForm.validateFields();
      const createdData = {
        name: row.name,
        database: row.database,
        username: row.username,
        password: row.password,
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
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="name"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên database' }]}
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
      title: 'Tên DB (database)',
      dataIndex: 'database',
      key: 'database',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="database"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên DB' }]}
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
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '20%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="username"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
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
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      width: '20%',
      editable: false,
      render: (text, record) => {
        if (record._id === 'new') {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="password"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập password' }]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
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
        </div>
      )}
    />
  );
};

export default AddDatabaseInNode
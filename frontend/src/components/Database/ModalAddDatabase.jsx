import React, { useState, useEffect } from "react";
import { Modal, message, Spin, Button, Switch, Form, Popconfirm, Input, InputNumber } from "antd";
import { editDatabase, createDatabase, deleteDatabase } from "../../api";
import { ModalComponent, TableComponent } from "../../util/helper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
const AddDatabaseInNode = (props) => {
  const { visible, onCancel, idNode, onOk, urlStringDefault, databases, fetchNode, nodes } = props;
  const [editForm] = Form.useForm();
  // const [isAdmin, setIsAdmin] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [addingRow, setAddingRow] = useState(null);
  const nameValue = Form.useWatch('name', editForm);

  const handleDelete = async (id) => {
    try {
      await deleteDatabase(id);
      await fetchNode(idNode);
      // socket.emit('update-menu-page');
      // socket.emit('update-menu-add-in-sheet', { sheetId: idDate });
      message.success('Xóa món thành công');
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Không thể xóa món');
    }
  };
  useEffect(() => {
    editForm.setFieldsValue({
      urlString: `${urlStringDefault}/${nameValue || ''}`,
    });
  }, [nameValue, urlStringDefault, editForm, nodes]);

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    editForm.setFieldsValue({ name: '', urlString: '', ...record });
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
      urlString: ''
    });
    setEditingKey('new');
    editForm.setFieldsValue({ name: '', urlString: '' });
  };

  const saveNew = async () => {
    try {
      const row = await editForm.validateFields();
      const createdData = {
        name: row.name,
        urlString: row.urlString,
        nodeId: idNode
      }
      await createDatabase(createdData);
      await fetchNode(idNode);
      setAddingRow(null);
      setEditingKey('');
      message.success('Thêm món mới thành công');
    } catch (err) {
      message.error('Không thể thêm món mới', err.massage);
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
      width: '30%',
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
      title: 'url',
      dataIndex: 'urlString',
      key: 'urlString',
      width: '40%',
      editable: true,
      render: (text, record) => {
        if (record._id === 'new' || isEditing(record)) {
          return (
            <Form form={editForm} component={false}>
              <Form.Item
                name="urlString"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập url' }]}
              >
                <div style={{ position: 'relative', width: '100%' }}>
                  <Input value={`${urlStringDefault}/${nameValue || ''}`} />
                </div>
              </Form.Item>
            </Form>
          );
        };
        return text;
      },
    },
  ];

  columns.push(
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
          {/* {isAdmin && ( */}
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
          {/* )} */}
        </div>
      )}
    />
  );
};

export default AddDatabaseInNode
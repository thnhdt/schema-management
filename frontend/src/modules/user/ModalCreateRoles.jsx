import React, { useState, useEffect } from "react";
import { getAllDatabasesAll } from '../../api/database';
import { createRoles } from '../../api/user';
import { Modal, Input, Select, Checkbox, Form, message, Divider, Tag } from 'antd';

const PERMISSIONS = [
  { label: 'update-table', value: 'update-table' },
  { label: 'update-function', value: 'update-function' },
  { label: 'update-sequence', value: 'update-sequence' }
];

const CreateRole = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [databases, setDatabases] = useState([]);
  const [selectedDbs, setSelectedDbs] = useState([]);
  const [dbPermissions, setDbPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCreate, setIsCreate] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDatabases();
      form.resetFields();
      setSelectedDbs([]);
      setDbPermissions({});
      setIsCreate(false);
    }
  }, [visible]);

  const fetchDatabases = async () => {
    try {
      const res = await getAllDatabasesAll();
      setDatabases(res.metaData || []);
    } catch {
      message.error('Không lấy được danh sách database!');
    }
  };

  const handleDbChange = (dbIds) => {
    setSelectedDbs(dbIds);
    setDbPermissions(prev => {
      const next = { ...prev };
      dbIds.forEach(id => {
        if (!next[id]) next[id] = ['select'];
      });
      Object.keys(next).forEach(id => {
        if (!dbIds.includes(id)) delete next[id];
      });
      return next;
    });
  };

  const handlePermChange = (dbId, perms) => {
    setDbPermissions(prev => ({ ...prev, [dbId]: ['select', ...perms] }));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const permissions = selectedDbs.map(dbId => ({
        databaseId: dbId,
        ops: dbPermissions[dbId] || ['select']
      }));
      await createRoles({
        roleName: values.roleName,
        permissions,
        isCreate
      });
      message.success('Tạo role thành công!');
      onOk && onOk();
    } catch (err) {
      message.error(err?.message || 'Tạo role thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Tạo Role mới"
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên role"
          name="roleName"
          rules={[{ required: true, message: 'Vui lòng nhập tên role!' }]}
        >
          <Input placeholder="Nhập tên role" />
        </Form.Item>
        <Form.Item label="Chọn database">
          <Select
            mode="multiple"
            placeholder="Chọn database"
            value={selectedDbs}
            onChange={handleDbChange}
            style={{ width: '100%' }}
          >
            {databases.map(db => (
              <Select.Option key={db._id} value={db._id}>{db.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        {selectedDbs.map(dbId => (
          <div key={dbId} style={{ marginBottom: 12, marginLeft: 8 }}>
            <b>{databases.find(db => db._id === dbId)?.name}</b>
            <Checkbox.Group
              options={PERMISSIONS}
              value={(dbPermissions[dbId] || []).filter(p => p !== 'select')}
              onChange={perms => handlePermChange(dbId, perms)}
              style={{ marginLeft: 16 }}
            />
            <span style={{ marginLeft: 8 }}><Tag color="blue">select (mặc định)</Tag></span>
          </div>
        ))}
        <Divider />
        <Form.Item>
          <Checkbox checked={isCreate} onChange={e => setIsCreate(e.target.checked)}>
            Cho phép tạo database mới
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRole;
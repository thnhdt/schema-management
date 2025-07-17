import React, { useState, useEffect } from "react";
import { getAllDatabasesAll } from '../../api/database';
import { createProject } from "../../api";
import { Modal, Input, Select, Form, message} from 'antd';

const CreateProject = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [databases, setDatabases] = useState([]);
  const [selectedDbs, setSelectedDbs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDatabases();
      form.resetFields();
      setSelectedDbs([]);
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
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const tablePre = values.tablePrefix.split(',').filter(Boolean);
      const functionPre = values.functionPrefix.split(',').filter(Boolean);
      const data = {
        name: values.name,
        selectedDbs,
        tablePrefix: tablePre,
        functionPrefix: functionPre
      }
      console.log(data);
      await createProject({
        name: values.name,
        databaseId: selectedDbs,
        tablePrefix: tablePre,
        functionPrefix: functionPre
      });
      message.success('Tạo Project thành công!');
      onOk && onOk();
    } catch (err) {
      message.error(err?.message || 'Tạo Project thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Tạo Project mới"
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên Project"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên role!' }]}
        >
          <Input placeholder="Nhập tên Project" />
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
        {/* {selectedDbs.map(dbId => (
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
        ))} */}
        {/* <Form.Item>
          <Checkbox checked={isCreate} onChange={e => setIsCreate(e.target.checked)}>
            Cho phép tạo database mới
          </Checkbox>
        </Form.Item> */}
        <Form.Item
          label="Table Prefix"
          name="tablePrefix"
        >
          <Input placeholder="Nhập các tiển tố cách nhau bởi dấu ',' VD: fw,cb,qlda" />
        </Form.Item>
        <Form.Item
          label="Function Prefix"
          name="functionPrefix"
        >
          <Input placeholder="Nhập các tiển tố cách nhau bởi dấu ',' VD: fw,cb,qlda" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProject;
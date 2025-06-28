import React, { useState, useCallback, useMemo } from 'react';
import { Button, Card, Space, Typography, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DatabaseOutlined, TableOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SchemaFlow = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAddTableModalVisible, setIsAddTableModalVisible] = useState(false);
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [columnForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddTable = () => {
    setIsAddTableModalVisible(true);
  };

  const handleAddColumn = () => {
    if (!selectedNode) {
      messageApi.warning('Vui lòng chọn một bảng trước khi thêm cột');
      return;
    }
    setIsAddColumnModalVisible(true);
  };

  const onAddTable = (values) => {
    messageApi.success('Thêm bảng thành công!');
    setIsAddTableModalVisible(false);
    form.resetFields();
  };

  const onAddColumn = (values) => {
    messageApi.success('Thêm cột thành công!');
    setIsAddColumnModalVisible(false);
    columnForm.resetFields();
  };

  const handleRefresh = () => {
    messageApi.success('Đã làm mới schema!');
  };

  return (
    <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
      {contextHolder}
      
      <Card title="PostgreSQL Schema Manager">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              <DatabaseOutlined /> Schema Flow Visualization
            </Title>
          </div>
          
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddTable}
            >
              Thêm Bảng
            </Button>
            <Button 
              icon={<PlusOutlined />} 
              onClick={handleAddColumn}
              disabled={!selectedNode}
            >
              Thêm Cột
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              Làm Mới
            </Button>
          </Space>

          <Card size="small" style={{ background: '#f5f5f5' }}>
            <Text strong>Demo Tables:</Text>
            <ul>
              <li><Text code>users</Text> - Bảng người dùng</li>
              <li><Text code>posts</Text> - Bảng bài viết</li>
              <li><Text code>categories</Text> - Bảng danh mục</li>
            </ul>
          </Card>
        </Space>
      </Card>

      {/* Modal thêm bảng */}
      <Modal
        title="Thêm Bảng Mới"
        open={isAddTableModalVisible}
        onCancel={() => setIsAddTableModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={onAddTable} layout="vertical">
          <Form.Item
            name="tableName"
            label="Tên Bảng"
            rules={[{ required: true, message: 'Vui lòng nhập tên bảng!' }]}
          >
            <Input placeholder="Nhập tên bảng..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button onClick={() => setIsAddTableModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm cột */}
      <Modal
        title="Thêm Cột Mới"
        open={isAddColumnModalVisible}
        onCancel={() => setIsAddColumnModalVisible(false)}
        footer={null}
      >
        <Form form={columnForm} onFinish={onAddColumn} layout="vertical">
          <Form.Item
            name="columnName"
            label="Tên Cột"
            rules={[{ required: true, message: 'Vui lòng nhập tên cột!' }]}
          >
            <Input placeholder="Nhập tên cột..." />
          </Form.Item>
          <Form.Item
            name="columnType"
            label="Kiểu Dữ Liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu!' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Option value="INTEGER">INTEGER</Option>
              <Option value="BIGINT">BIGINT</Option>
              <Option value="VARCHAR(255)">VARCHAR(255)</Option>
              <Option value="TEXT">TEXT</Option>
              <Option value="BOOLEAN">BOOLEAN</Option>
              <Option value="TIMESTAMP">TIMESTAMP</Option>
              <Option value="DATE">DATE</Option>
              <Option value="DECIMAL(10,2)">DECIMAL(10,2)</Option>
              <Option value="JSON">JSON</Option>
              <Option value="UUID">UUID</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isPrimary" valuePropName="checked">
            <Input type="checkbox" /> Khóa chính
          </Form.Item>
          <Form.Item name="isNullable" valuePropName="checked" initialValue={true}>
            <Input type="checkbox" /> Cho phép NULL
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button onClick={() => setIsAddColumnModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchemaFlow; 
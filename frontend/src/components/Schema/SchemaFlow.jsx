import React, { useState, useCallback, useMemo } from 'react';
import { Button, Card, Space, Typography, Modal, Form, Input, Select, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, DatabaseOutlined, TableOutlined, ReloadOutlined, InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { TableComponent } from '../../util/helper';

const { Title, Text } = Typography;
const { Option } = Select;

const SchemaFlow = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAddTableModalVisible, setIsAddTableModalVisible] = useState(false);
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [columnForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Demo data for schema tables
  const [schemaTables, setSchemaTables] = useState([
    {
      key: '1',
      tableName: 'users',
      description: 'Bảng người dùng',
      columns: 5,
      relationships: 2,
      status: 'active'
    },
    {
      key: '2',
      tableName: 'posts',
      description: 'Bảng bài viết',
      columns: 8,
      relationships: 3,
      status: 'active'
    },
    {
      key: '3',
      tableName: 'categories',
      description: 'Bảng danh mục',
      columns: 4,
      relationships: 1,
      status: 'active'
    },
    {
      key: '4',
      tableName: 'comments',
      description: 'Bảng bình luận',
      columns: 6,
      relationships: 2,
      status: 'active'
    },
    {
      key: '5',
      tableName: 'tags',
      description: 'Bảng thẻ',
      columns: 3,
      relationships: 1,
      status: 'active'
    },
    {
      key: '6',
      tableName: 'user_profiles',
      description: 'Bảng thông tin chi tiết người dùng',
      columns: 10,
      relationships: 1,
      status: 'active'
    },
    {
      key: '7',
      tableName: 'post_tags',
      description: 'Bảng quan hệ bài viết và thẻ',
      columns: 2,
      relationships: 2,
      status: 'active'
    },
    {
      key: '8',
      tableName: 'notifications',
      description: 'Bảng thông báo',
      columns: 7,
      relationships: 1,
      status: 'active'
    },
    {
      key: '9',
      tableName: 'sessions',
      description: 'Bảng phiên đăng nhập',
      columns: 4,
      relationships: 1,
      status: 'active'
    },
    {
      key: '10',
      tableName: 'audit_logs',
      description: 'Bảng nhật ký kiểm toán',
      columns: 8,
      relationships: 0,
      status: 'active'
    },
    {
      key: '11',
      tableName: 'settings',
      description: 'Bảng cài đặt hệ thống',
      columns: 5,
      relationships: 0,
      status: 'active'
    },
    {
      key: '12',
      tableName: 'permissions',
      description: 'Bảng quyền hạn',
      columns: 6,
      relationships: 2,
      status: 'active'
    },
    {
      key: '13',
      tableName: 'roles',
      description: 'Bảng vai trò',
      columns: 4,
      relationships: 1,
      status: 'active'
    },
    {
      key: '14',
      tableName: 'user_roles',
      description: 'Bảng quan hệ người dùng và vai trò',
      columns: 2,
      relationships: 2,
      status: 'active'
    },
    {
      key: '15',
      tableName: 'files',
      description: 'Bảng quản lý file',
      columns: 9,
      relationships: 1,
      status: 'active'
    }
  ]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/schema');
    }
  };

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
    const newTable = {
      key: Date.now().toString(),
      tableName: values.tableName,
      description: values.description || 'Bảng mới',
      columns: 0,
      relationships: 0,
      status: 'active'
    };
    setSchemaTables([...schemaTables, newTable]);
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

  const handleTableSelect = (record) => {
    setSelectedNode(record);
  };

  const tableColumns = [
    {
      title: 'Tên Bảng',
      dataIndex: 'tableName',
      key: 'tableName',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <TableOutlined />
          <Text code>{text}</Text>
          {record.status === 'active' && (
            <Tag color="green">Active</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text) => (
        <Text type="secondary">{text}</Text>
      ),
    },
    {
      title: 'Số Cột',
      dataIndex: 'columns',
      key: 'columns',
      width: 100,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Quan Hệ',
      dataIndex: 'relationships',
      key: 'relationships',
      width: 100,
      render: (text) => (
        <Tag color="purple">{text}</Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text) => (
        <Tag color={text === 'active' ? 'green' : 'red'}>
          {text === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: () => (
        <Text type="secondary">2024-01-15</Text>
      ),
    },
    {
      title: 'Người Tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: () => (
        <Text type="secondary">admin</Text>
      ),
    },
    {
      title: 'Kích Thước',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: () => (
        <Text type="secondary">2.5 MB</Text>
      ),
    },
    {
      title: 'Phiên Bản',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: () => (
        <Text code>v1.0</Text>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết bảng">
            <Button
              type="primary"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => handleTableSelect(record)}
            />
          </Tooltip>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedNode(record);
              handleAddColumn();
            }}
          >
            Thêm Cột
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="schema-flow-container" style={{ height: 'calc(100vh - 112px)' }}>
      {contextHolder}
      
      <div className="schema-flow-content" style={{ height: 'calc(100vh - 112px)' }}>
        <div style={{ marginBottom: 20 }}>
          <Space align="center">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
            >
              Quay lại Schema
            </Button>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <DatabaseOutlined /> Schema Flow Visualization
            </Title>
          </Space>
        </div>

        <Card title="PostgreSQL Schema Manager" style={{ height: 'calc(100vh - 200px)' }}>
          <Space direction="vertical" size="large" style={{ width: '100%', height: '100%' }}>
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
              <Text strong>Thông tin Schema:</Text>
              <ul>
                <li>Tổng số bảng: <Text code>{schemaTables.length}</Text></li>
                <li>Tổng số cột: <Text code>{schemaTables.reduce((sum, table) => sum + table.columns, 0)}</Text></li>
                <li>Tổng số quan hệ: <Text code>{schemaTables.reduce((sum, table) => sum + table.relationships, 0)}</Text></li>
              </ul>
            </Card>

            <div className="schema-flow-table" style={{ flex: 1, height: 'calc(100vh - 400px)' }}>
              <TableComponent
                columns={tableColumns}
                data={schemaTables}
                rowClassName={() => ''}
                size="middle"
                title={'Danh sách bảng'}
                customButton={null}
              />
            </div>
          </Space>
        </Card>
      </div>

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
          <Form.Item
            name="description"
            label="Mô Tả"
          >
            <Input.TextArea placeholder="Nhập mô tả bảng..." rows={3} />
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
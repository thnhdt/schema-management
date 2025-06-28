import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Select, message, Typography, Tag, Tooltip, Popconfirm } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined,
  KeyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { getTableRelationships, createRelationship, deleteRelationship } from '../../api/index';

const { Title, Text } = Typography;
const { Option } = Select;

const RelationshipViewer = ({ schemaName, tableName, onUpdate }) => {
  const [relationships, setRelationships] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddRelationshipModalVisible, setIsAddRelationshipModalVisible] = useState(false);
  const [isEditRelationshipModalVisible, setIsEditRelationshipModalVisible] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (schemaName && tableName) {
      loadRelationships();
    }
  }, [schemaName, tableName]);

  const loadRelationships = async () => {
    try {
      setLoading(true);
      const response = await getTableRelationships(schemaName, tableName);
      setRelationships(response.data || []);
    } catch (error) {
      messageApi.error('Không thể tải thông tin relationships: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    form.resetFields();
    setIsAddRelationshipModalVisible(true);
  };

  const handleEditRelationship = (relationship) => {
    setEditingRelationship(relationship);
    form.setFieldsValue({
      constraintName: relationship.constraint_name,
      foreignTable: relationship.foreign_table_name,
      foreignColumn: relationship.foreign_column_name,
      localColumn: relationship.column_name,
      onDelete: relationship.on_delete || 'NO ACTION',
      onUpdate: relationship.on_update || 'NO ACTION'
    });
    setIsEditRelationshipModalVisible(true);
  };

  const handleDeleteRelationship = async (constraintName) => {
    try {
      await deleteRelationship(constraintName);
      messageApi.success('Xóa relationship thành công!');
      loadRelationships();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Xóa relationship thất bại: ' + error.message);
    }
  };

  const onAddRelationshipSubmit = async (values) => {
    try {
      const relationshipData = {
        constraintName: values.constraintName,
        tableName: tableName,
        columnName: values.localColumn,
        foreignTableName: values.foreignTable,
        foreignColumnName: values.foreignColumn,
        onDelete: values.onDelete,
        onUpdate: values.onUpdate
      };

      await createRelationship(relationshipData);
      messageApi.success('Thêm relationship thành công!');
      setIsAddRelationshipModalVisible(false);
      form.resetFields();
      loadRelationships();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Thêm relationship thất bại: ' + error.message);
    }
  };

  const onEditRelationshipSubmit = async (values) => {
    try {
      const relationshipData = {
        constraintName: values.constraintName,
        tableName: tableName,
        columnName: values.localColumn,
        foreignTableName: values.foreignTable,
        foreignColumnName: values.foreignColumn,
        onDelete: values.onDelete,
        onUpdate: values.onUpdate
      };

      await createRelationship(relationshipData);
      messageApi.success('Cập nhật relationship thành công!');
      setIsEditRelationshipModalVisible(false);
      setEditingRelationship(null);
      form.resetFields();
      loadRelationships();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Cập nhật relationship thất bại: ' + error.message);
    }
  };

  const relationshipColumns = [
    {
      title: 'Tên Constraint',
      dataIndex: 'constraint_name',
      key: 'constraint_name',
      render: (text) => (
        <Text code>{text}</Text>
      ),
    },
    {
      title: 'Cột Hiện Tại',
      dataIndex: 'column_name',
      key: 'column_name',
      render: (text) => (
        <Space>
          <Text code>{text}</Text>
          <Tag color="blue" icon={<KeyOutlined />}>FK</Tag>
        </Space>
      ),
    },
    {
      title: 'Bảng Tham Chiếu',
      dataIndex: 'foreign_table_name',
      key: 'foreign_table_name',
      render: (text) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: 'Cột Tham Chiếu',
      dataIndex: 'foreign_column_name',
      key: 'foreign_column_name',
      render: (text) => (
        <Text code>{text}</Text>
      ),
    },
    {
      title: 'ON DELETE',
      dataIndex: 'on_delete',
      key: 'on_delete',
      render: (text) => (
        <Tag color={text === 'CASCADE' ? 'red' : text === 'SET NULL' ? 'orange' : 'default'}>
          {text || 'NO ACTION'}
        </Tag>
      ),
    },
    {
      title: 'ON UPDATE',
      dataIndex: 'on_update',
      key: 'on_update',
      render: (text) => (
        <Tag color={text === 'CASCADE' ? 'red' : text === 'SET NULL' ? 'orange' : 'default'}>
          {text || 'NO ACTION'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa relationship">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRelationship(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa relationship "${record.constraint_name}"?`}
            onConfirm={() => handleDeleteRelationship(record.constraint_name)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      
      <Card
        title={
          <Space>
            <LinkOutlined />
            <span>Foreign Key Relationships</span>
            <Tag color="blue">{tableName}</Tag>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddRelationship}
          >
            Thêm Relationship
          </Button>
        }
      >
        {relationships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LinkOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              Chưa có relationship nào
            </Title>
            <Text type="secondary">
              Click "Thêm Relationship" để tạo foreign key constraint
            </Text>
          </div>
        ) : (
          <Table
            columns={relationshipColumns}
            dataSource={relationships}
            loading={loading}
            rowKey="constraint_name"
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* Modal thêm relationship */}
      <Modal
        title="Thêm Foreign Key Relationship"
        open={isAddRelationshipModalVisible}
        onCancel={() => setIsAddRelationshipModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={onAddRelationshipSubmit} layout="vertical">
          <Form.Item
            name="constraintName"
            label="Tên Constraint"
            rules={[{ required: true, message: 'Vui lòng nhập tên constraint!' }]}
          >
            <Input placeholder="fk_table_column" />
          </Form.Item>
          
          <Form.Item
            name="localColumn"
            label="Cột Hiện Tại"
            rules={[{ required: true, message: 'Vui lòng chọn cột!' }]}
          >
            <Select placeholder="Chọn cột trong bảng hiện tại">
              {/* TODO: Load columns from current table */}
              <Option value="id">id</Option>
              <Option value="user_id">user_id</Option>
              <Option value="category_id">category_id</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="foreignTable"
            label="Bảng Tham Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn bảng tham chiếu!' }]}
          >
            <Select placeholder="Chọn bảng tham chiếu">
              {/* TODO: Load tables from schema */}
              <Option value="users">users</Option>
              <Option value="categories">categories</Option>
              <Option value="posts">posts</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="foreignColumn"
            label="Cột Tham Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn cột tham chiếu!' }]}
          >
            <Select placeholder="Chọn cột tham chiếu">
              <Option value="id">id</Option>
              <Option value="name">name</Option>
            </Select>
          </Form.Item>
          
          <Divider>Referential Actions</Divider>
          
          <Form.Item
            name="onDelete"
            label="ON DELETE"
            initialValue="NO ACTION"
          >
            <Select>
              <Option value="NO ACTION">NO ACTION</Option>
              <Option value="CASCADE">CASCADE</Option>
              <Option value="SET NULL">SET NULL</Option>
              <Option value="SET DEFAULT">SET DEFAULT</Option>
              <Option value="RESTRICT">RESTRICT</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="onUpdate"
            label="ON UPDATE"
            initialValue="NO ACTION"
          >
            <Select>
              <Option value="NO ACTION">NO ACTION</Option>
              <Option value="CASCADE">CASCADE</Option>
              <Option value="SET NULL">SET NULL</Option>
              <Option value="SET DEFAULT">SET DEFAULT</Option>
              <Option value="RESTRICT">RESTRICT</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button onClick={() => setIsAddRelationshipModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa relationship */}
      <Modal
        title="Chỉnh Sửa Foreign Key Relationship"
        open={isEditRelationshipModalVisible}
        onCancel={() => setIsEditRelationshipModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={onEditRelationshipSubmit} layout="vertical">
          <Form.Item
            name="constraintName"
            label="Tên Constraint"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="localColumn"
            label="Cột Hiện Tại"
            rules={[{ required: true, message: 'Vui lòng chọn cột!' }]}
          >
            <Select placeholder="Chọn cột trong bảng hiện tại">
              <Option value="id">id</Option>
              <Option value="user_id">user_id</Option>
              <Option value="category_id">category_id</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="foreignTable"
            label="Bảng Tham Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn bảng tham chiếu!' }]}
          >
            <Select placeholder="Chọn bảng tham chiếu">
              <Option value="users">users</Option>
              <Option value="categories">categories</Option>
              <Option value="posts">posts</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="foreignColumn"
            label="Cột Tham Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn cột tham chiếu!' }]}
          >
            <Select placeholder="Chọn cột tham chiếu">
              <Option value="id">id</Option>
              <Option value="name">name</Option>
            </Select>
          </Form.Item>
          
          <Divider>Referential Actions</Divider>
          
          <Form.Item
            name="onDelete"
            label="ON DELETE"
          >
            <Select>
              <Option value="NO ACTION">NO ACTION</Option>
              <Option value="CASCADE">CASCADE</Option>
              <Option value="SET NULL">SET NULL</Option>
              <Option value="SET DEFAULT">SET DEFAULT</Option>
              <Option value="RESTRICT">RESTRICT</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="onUpdate"
            label="ON UPDATE"
          >
            <Select>
              <Option value="NO ACTION">NO ACTION</Option>
              <Option value="CASCADE">CASCADE</Option>
              <Option value="SET NULL">SET NULL</Option>
              <Option value="SET DEFAULT">SET DEFAULT</Option>
              <Option value="RESTRICT">RESTRICT</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
              <Button onClick={() => setIsEditRelationshipModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RelationshipViewer; 
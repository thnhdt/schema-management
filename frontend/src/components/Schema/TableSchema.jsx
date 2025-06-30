import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Typography,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  LinkOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { getTableColumns, addColumn, updateColumn, deleteColumn } from '../../api/index';
import { TableComponent } from '../../util/helper';

const { Title, Text } = Typography;
const { Option } = Select;

const TableSchema = ({ schemaName, tableName, onUpdate }) => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
  const [isEditColumnModalVisible, setIsEditColumnModalVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (schemaName && tableName) {
      loadColumns();
    }
  }, [schemaName, tableName]);

  const loadColumns = async () => {
    try {
      setLoading(true);
      const response = await getTableColumns(schemaName, tableName);
      setColumns(response.data || []);
    } catch (error) {
      messageApi.error('Không thể tải thông tin cột: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    setEditingColumn(null);
    form.resetFields();
    setIsAddColumnModalVisible(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    form.setFieldsValue({
      columnName: column.column_name,
      columnType: column.data_type,
      isNullable: column.is_nullable === 'YES',
      isPrimary: column.column_default?.includes('nextval') || false,
      defaultValue: column.column_default,
      comment: column.column_comment || ''
    });
    setIsEditColumnModalVisible(true);
  };

  const handleDeleteColumn = async (columnName) => {
    try {
      await deleteColumn(schemaName, tableName, columnName);
      messageApi.success('Xóa cột thành công!');
      loadColumns();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Xóa cột thất bại: ' + error.message);
    }
  };

  const onAddColumnSubmit = async (values) => {
    try {
      const columnData = {
        name: values.columnName,
        type: values.columnType,
        nullable: values.isNullable,
        primary: values.isPrimary,
        default: values.defaultValue,
        comment: values.comment
      };

      await addColumn(schemaName, tableName, columnData);
      messageApi.success('Thêm cột thành công!');
      setIsAddColumnModalVisible(false);
      form.resetFields();
      loadColumns();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Thêm cột thất bại: ' + error.message);
    }
  };

  const onEditColumnSubmit = async (values) => {
    try {
      const columnData = {
        type: values.columnType,
        nullable: values.isNullable,
        primary: values.isPrimary,
        default: values.defaultValue,
        comment: values.comment
      };

      await updateColumn(schemaName, tableName, editingColumn.column_name, columnData);
      messageApi.success('Cập nhật cột thành công!');
      setIsEditColumnModalVisible(false);
      setEditingColumn(null);
      form.resetFields();
      loadColumns();
      if (onUpdate) onUpdate();
    } catch (error) {
      messageApi.error('Cập nhật cột thất bại: ' + error.message);
    }
  };

  const tableColumns = [
    {
      title: 'Tên Cột',
      dataIndex: 'column_name',
      key: 'column_name',
      render: (text, record) => (
        <Space>
          <Text code>{text}</Text>
          {record.column_default?.includes('nextval') && (
            <Tag color="blue" icon={<KeyOutlined />}>PK</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Kiểu Dữ Liệu',
      dataIndex: 'data_type',
      key: 'data_type',
      render: (text, record) => (
        <Text type="secondary">{text}</Text>
      ),
    },
    {
      title: 'Nullable',
      dataIndex: 'is_nullable',
      key: 'is_nullable',
      render: (text) => (
        <Tag color={text === 'YES' ? 'green' : 'red'}>
          {text === 'YES' ? 'NULL' : 'NOT NULL'}
        </Tag>
      ),
    },
    {
      title: 'Default',
      dataIndex: 'column_default',
      key: 'column_default',
      render: (text) => (
        <Text type="secondary">{text || '-'}</Text>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'column_comment',
      key: 'column_comment',
      render: (text) => (
        <Text type="secondary">{text || '-'}</Text>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa cột">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditColumn(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa cột "${record.column_name}"?`}
            onConfirm={() => handleDeleteColumn(record.column_name)}
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
            <span>Bảng: {tableName}</span>
            <Tag color="blue">{schemaName}</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddColumn}
          >
            Thêm Cột
          </Button>
        }
      >
        <TableComponent
          columns={tableColumns}
          data={columns}
          loading={loading}
          rowKey="column_name"
          pagination={false}
          rowClassName={() => { 'no-hover' }}
          size="small"
          title={'Danh sách cột'}
          customButton={null}
        />
      </Card>

      {/* Modal thêm cột */}
      <Modal
        title="Thêm Cột Mới"
        open={isAddColumnModalVisible}
        onCancel={() => setIsAddColumnModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={onAddColumnSubmit} layout="vertical">
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
              <Option value="SERIAL">SERIAL</Option>
              <Option value="BIGSERIAL">BIGSERIAL</Option>
              <Option value="VARCHAR(255)">VARCHAR(255)</Option>
              <Option value="TEXT">TEXT</Option>
              <Option value="BOOLEAN">BOOLEAN</Option>
              <Option value="TIMESTAMP">TIMESTAMP</Option>
              <Option value="DATE">DATE</Option>
              <Option value="DECIMAL(10,2)">DECIMAL(10,2)</Option>
              <Option value="JSON">JSON</Option>
              <Option value="JSONB">JSONB</Option>
              <Option value="UUID">UUID</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isNullable" valuePropName="checked" initialValue={true}>
            <Switch /> Cho phép NULL
          </Form.Item>

          <Form.Item name="isPrimary" valuePropName="checked">
            <Switch /> Khóa chính (Primary Key)
          </Form.Item>

          <Form.Item name="defaultValue" label="Giá Trị Mặc Định">
            <Input placeholder="Nhập giá trị mặc định..." />
          </Form.Item>

          <Form.Item name="comment" label="Ghi Chú">
            <Input.TextArea placeholder="Nhập ghi chú cho cột..." rows={3} />
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

      {/* Modal chỉnh sửa cột */}
      <Modal
        title="Chỉnh Sửa Cột"
        open={isEditColumnModalVisible}
        onCancel={() => setIsEditColumnModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={onEditColumnSubmit} layout="vertical">
          <Form.Item
            name="columnName"
            label="Tên Cột"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="columnType"
            label="Kiểu Dữ Liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu!' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Option value="INTEGER">INTEGER</Option>
              <Option value="BIGINT">BIGINT</Option>
              <Option value="SERIAL">SERIAL</Option>
              <Option value="BIGSERIAL">BIGSERIAL</Option>
              <Option value="VARCHAR(255)">VARCHAR(255)</Option>
              <Option value="TEXT">TEXT</Option>
              <Option value="BOOLEAN">BOOLEAN</Option>
              <Option value="TIMESTAMP">TIMESTAMP</Option>
              <Option value="DATE">DATE</Option>
              <Option value="DECIMAL(10,2)">DECIMAL(10,2)</Option>
              <Option value="JSON">JSON</Option>
              <Option value="JSONB">JSONB</Option>
              <Option value="UUID">UUID</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isNullable" valuePropName="checked">
            <Switch /> Cho phép NULL
          </Form.Item>

          <Form.Item name="isPrimary" valuePropName="checked">
            <Switch /> Khóa chính (Primary Key)
          </Form.Item>

          <Form.Item name="defaultValue" label="Giá Trị Mặc Định">
            <Input placeholder="Nhập giá trị mặc định..." />
          </Form.Item>

          <Form.Item name="comment" label="Ghi Chú">
            <Input.TextArea placeholder="Nhập ghi chú cho cột..." rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
              <Button onClick={() => setIsEditColumnModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableSchema; 
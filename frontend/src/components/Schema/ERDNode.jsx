import React from 'react';
import { Card, Table, Tag } from 'antd';
import { Handle, Position } from '@xyflow/react';

const ERDNode = ({ data }) => {
  const { label, columns, tableName } = data;

  const getColumnTypeColor = (type) => {
    const typeColors = {
      'SERIAL': 'blue',
      'INTEGER': 'green',
      'VARCHAR': 'orange',
      'TEXT': 'purple',
      'TIMESTAMP': 'red',
      'BOOLEAN': 'cyan',
      'DECIMAL': 'magenta',
      'DATE': 'geekblue'
    };
    return typeColors[type] || 'default';
  };

  const tableColumns = [
    {
      title: 'Column',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {record.isPrimaryKey && <Tag color="red" size="small">PK</Tag>}
          {!record.isNullable && <Tag color="orange" size="small">NN</Tag>}
          <span style={{ fontFamily: 'monospace', fontWeight: record.isPrimaryKey ? 'bold' : 'normal' }}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Tag color={getColumnTypeColor(text)} size="small">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Default',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (text) => text ? (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
          {text}
        </span>
      ) : '-',
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Source handles for foreign keys */}
      {columns?.map((column, index) => (
        <Handle
          key={`source-${column.name}`}
          type="source"
          position={Position.Right}
          id={`${tableName}-${column.name}`}
          style={{
            top: `${20 + (index + 1) * 25}px`,
            background: '#555',
            width: '8px',
            height: '8px',
          }}
        />
      ))}

      {/* Target handles for primary keys */}
      {columns?.filter(col => col.isPrimaryKey).map((column, index) => (
        <Handle
          key={`target-${column.name}`}
          type="target"
          position={Position.Left}
          id={`${tableName}-${column.name}`}
          style={{
            top: `${20 + (columns.findIndex(col => col.name === column.name) + 1) * 25}px`,
            background: '#ff4d4f',
            width: '8px',
            height: '8px',
          }}
        />
      ))}

      <Card
        size="small"
        title={
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: '#1890ff',
            textAlign: 'center'
          }}>
            {label}
          </div>
        }
        style={{
          minWidth: '250px',
          maxWidth: '350px',
          border: '2px solid #1890ff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        bodyStyle={{ padding: '8px' }}
      >
        <Table
          columns={tableColumns}
          dataSource={columns?.map((col, index) => ({ ...col, key: index })) || []}
          pagination={false}
          size="small"
          showHeader={false}
          style={{ fontSize: '12px' }}
        />
      </Card>
    </div>
  );
};

export default ERDNode; 
import React, { useState, useEffect } from "react";
import { Card, message, Tag, Checkbox, Space } from "antd";

import { ModalComponent, TableComponent } from "../../util/helper";
import { SwapOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import '../../App.css';
const ModalLogComponent = (props) => {
  const { onCancel, visible, log = [] } = props;
  const [messageApi, contextHolder] = message.useMessage();
  // const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState([]);
  const hanldeCopyText = () => {
    navigator.clipboard.writeText(selectedRowKeys.join('\n') ?? '');
    messageApi.open({
      type: 'success',
      content: 'Copy thành công',
    });
  }
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const allKeys = log.map(item => item.key);
  const allChecked = selectedRowKeys.length === allKeys.length && allKeys.length > 0;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < allKeys.length;
  useEffect(() => {
    if (!log || log.length === 0) {
      setGroupedLogs([]);
      return;
    }

    const groupedByLog = log.reduce((acc, log) => {
      if (!acc[log.table]) {
        acc[log.table] = [];
      }
      acc[log.table].push(log);
      return acc;
    }, {});

    const finalGroupedData = [];
    const uniqueLogs = [...new Set(log.map(log => log.table))];

    uniqueLogs.forEach(log => {
      const userOrders = groupedByLog[log];
      userOrders.forEach((log, index) => {
        finalGroupedData.push({
          ...log,
          rowSpan: index === 0 ? userOrders.length : 0,
        });
      });
    });

    setGroupedLogs(finalGroupedData);
  }, [log]);

  const handleGroupCheckbox = (table, checked) => {
    const groupKeys = groupedLogs.filter(log => log.table === table).map(log => `${log.key}`);
    if (checked) {
      setSelectedRowKeys(prev => Array.from(new Set([...prev, ...groupKeys])));
    } else {
      setSelectedRowKeys(prev => prev.filter(key => !groupKeys.includes(key)));
    }
  };

  const isGroupChecked = (table) => {
    const groupKeys = groupedLogs.filter(log => log.table === table).map(log => `${log.key}`);
    return groupKeys.every(key => selectedRowKeys.includes(key));
  };

  const enumTitleLog = {
    'drop_table': "Xóa Bảng",
    'drop_column': 'Xóa cột',
    'set_type': 'Chuyển kiểu',
    'set_not_null': 'Cần có dữ liệu'
  }
  const enumTypeColor = {
    'CREATE': 'green',
    'UPDATE': 'purple',
    "DELETE": 'red'
  }
  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 50,
      render: (_, record) => {
        if (record.rowSpan > 0) {
          const groupKeys = groupedLogs.filter(log => log.table === record.table).map(log => `${log.key}`);
          const checked = isGroupChecked(record.table);
          const indeterminate = groupKeys.some(key => selectedRowKeys.includes(key)) && !checked;
          return (
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={e => handleGroupCheckbox(record.table, e.target.checked)}
            />
          );
        }
        return null;
      },
      onCell: (record) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: 'Table',
      dataIndex: 'table',
      key: 'table',
      width: '20%',
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'target',
      key: 'target',
      width: '20%',
      render: target => <h7>{enumTitleLog[target]}</h7>
    },
    {
      title: 'SQL thay đổi',
      dataIndex: 'ddl',
      key: 'ddl',
      width: '50%',
      render: ddl => <div>{ddl}</div>
    },
    {
      title: 'Kiểu loại',
      key: 'type',
      dataIndex: 'type',
      width: '10%',
      render: (type) => (
        <>
          <Tag color={enumTypeColor[type]}>
            {type}
          </Tag>
        </>
      ),
    },
  ];
  return (
    <>
      {contextHolder}
      <ModalComponent
        onCancel={onCancel}
        width={'75%'}
        onOk={hanldeCopyText}
        open={visible}
        okText={'Copy'}
        okButtonProps={{ disabled: selectedRowKeys.length === 0 }}
        Component={(
          <>
            <div style={{ marginTop: '1.5rem', flex: 1, overflow: 'auto', }}>
              <TableComponent
                title={
                  <Space direction="vertical">
                    <span> Tất cả các logs </span>
                    <div style={{ marginBottom: 8, marginLeft: 16 }}>
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={allChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedRowKeys(allKeys);
                          } else {
                            setSelectedRowKeys([]);
                          }
                        }}
                      >
                        Chọn tất cả
                      </Checkbox>
                    </div>
                  </Space>
                }
                customButton={undefined}
                columns={columns}
                data={groupedLogs}
                loading={false}
                scroll={{ x: 'max-content' }}
                // rowSelection={rowSelection} // bỏ rowSelection mặc định
                rowKey={record => `${record.key}`}
              />
            </div>
          </>
        )}
      />
    </>

  );
};

export default ModalLogComponent
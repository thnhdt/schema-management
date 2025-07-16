import React, { useState } from "react";
import { Card, message, Tag } from "antd";

import { ModalComponent, TableComponent } from "../../util/helper";
import { SwapOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import '../../App.css';
const ModalLogComponent = (props) => {
  const { onCancel, visible, log = [] } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const hanldeCopyText = () => {
    navigator.clipboard.writeText(selectedRowKeys.join('\n') ?? '');
    messageApi.open({
      type: 'success',
      content: 'Copy thành công',
    });
  }
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = newSelectedRowKeys => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
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
  const columns = [{
    title: 'Table',
    dataIndex: 'table',
    key: 'table',
    width: '20%'
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
  },];
  return (
    <>
      {contextHolder}
      <ModalComponent
        onCancel={onCancel}
        width={'75%'}
        onOk={hanldeCopyText}
        open={visible}
        okText={'Copy'}
        Component={(
          <div style={{ marginTop: '1.5rem', flex: 1, overflow: 'auto', }}>

            <TableComponent
              title={'Tất cả các logs'}
              customButton={undefined}
              columns={columns}
              data={log}
              loading={false}
              scroll={{ x: 'max-content' }}
              rowSelection={rowSelection}
              rowKey={record => `${record.key}`}
            />
          </div>
        )}
      />
    </>

  );
};

export default ModalLogComponent
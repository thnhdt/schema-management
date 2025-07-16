import {
  UnorderedListOutlined,
  LoadingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import '../../App.css';
import { List, Typography, Spin, Flex, Tag, Space, Divider, Checkbox } from 'antd';

const enumTypeColor = {
  'CREATE': 'green',
  'UPDATE': 'purple',
  "DELETE": 'red'
}
const enumTypeTitle = {
  'CREATE': 'Thêm hàm',
  'UPDATE': 'Cập nhật trên hàm',
  "DELETE": 'Xóa hàm'
}
const FunctionCompareComponent = ({ loading, updateData, currentDatabase, targetDatabase, onShowDetail, selectedFunctions = [], setSelectedFunctions }) => {
  const { Paragraph } = Typography;
  const allKeys = updateData.map(item => item.key);
  const allChecked = selectedFunctions.length === allKeys.length && allKeys.length > 0;
  const isIndeterminate = selectedFunctions.length > 0 && selectedFunctions.length < allKeys.length;
  if (loading) {
    return (
      <>
        <Flex align="center"
          justify="center"
          style={{ height: '80%' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </Flex>
      </>);
  }
  return (
    <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto' }}>
      <div style={{ marginBottom: 8, marginLeft: 16 }}>
        <Checkbox
          indeterminate={isIndeterminate}
          checked={allChecked}
          onChange={e => {
            if (e.target.checked) {
              setSelectedFunctions(allKeys);
            } else {
              setSelectedFunctions([]);
            }
          }}
        >
          Chọn tất cả
        </Checkbox>
      </div>
      <List
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={updateData}
        renderItem={item => {
          const checked = selectedFunctions.includes(item.key);
          return (
            <List.Item
              key={item.key}
              className="hover-overlay shadow-sm rounded mb-4"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  marginLeft: '1rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedFunctions([...selectedFunctions, item.key]);
                    } else {
                      setSelectedFunctions(selectedFunctions.filter(k => k !== item.key));
                    }
                  }}
                  style={{ marginRight: 8 }}
                />
                <Tag
                  color={enumTypeColor[item.type]}
                  style={{ margin: 0, flexShrink: 0 }}
                >
                  {item.type}
                </Tag>
                <div style={{ flex: 1 }} onClick={() => onShowDetail && onShowDetail({
                  key: `${enumTypeTitle[item.type]} ${item.key}`,
                  ddlPrime: item.ddlPrimeFunction ?? '',
                  ddlSecond: item.ddlSecondFunction ?? '',
                  patch: item.patch ?? '',
                  currentDatabase,
                  targetDatabase
                })}>
                  <List.Item.Meta
                    title={`${enumTypeTitle[item.type]} ${item.key}`}
                  />
                  <Paragraph
                    ellipsis={{ rows: 4 }}
                    style={{ marginBottom: 0 }}
                  >
                    {item.patch}
                  </Paragraph>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}

export default FunctionCompareComponent;

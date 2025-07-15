import {
  UnorderedListOutlined,
  LoadingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import '../../App.css';
import { List, Typography, Spin, Flex, Tag, Space, Divider } from 'antd';

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
const FunctionCompareComponent = ({ loading, updateData, currentDatabase, targetDatabase, onShowDetail }) => {
  const { Paragraph } = Typography;
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
      <List
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={updateData}
        renderItem={item => (
          <List.Item
            key={item.key}
            onClick={() => onShowDetail && onShowDetail({
              key: `${enumTypeTitle[item.type]} ${item.key}`,
              ddlPrime: item.ddlPrimeFunction ?? '',
              ddlSecond: item.ddlSecondFunction ?? '',
              patch: item.patch ?? '',
              currentDatabase,
              targetDatabase
            })}
            className="hover-overlay shadow-sm rounded mb-4"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3rem',
                width: '100%',
                marginLeft: '1rem'
              }}
            >
              <Tag
                color={enumTypeColor[item.type]}
                style={{ margin: 0, flexShrink: 0 }}
              >
                {item.type}
              </Tag>

              <div style={{ flex: 1 }}>
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
        )}
      />
    </div>
  );
}

export default FunctionCompareComponent;

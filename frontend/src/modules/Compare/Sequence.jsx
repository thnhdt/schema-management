import '../../App.css';
import { Card, List, Typography, Tag } from 'antd';

const enumTypeColor = {
  'CREATE': 'green',
  'UPDATE': 'purple',
  "DELETE": 'red'
}
const enumTypeTitle = {
  'CREATE': 'Thêm mới sequence',
  "DELETE": 'Xóa đi sequence'
}
const SequenceCompareComponent = ({ sequence, onShowDetail, currentDatabase, targetDatabase }) => {
  const { Paragraph } = Typography;
  return (
    <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto' }}>
      <List
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={sequence}
        renderItem={(item, idx) => (
          <List.Item
            key={item.key + '-' + item.type + '-' + idx}
            onClick={() => onShowDetail && onShowDetail({
              key: `${enumTypeTitle[item.type]} ${item.key}`,
              ddlPrime: item.ddl ?? '',
              ddlSecond: '',
              patch: item.ddl ?? '',
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
                  style={{ marginBottom: 0 }}
                >
                  {item.ddl}
                </Paragraph>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default SequenceCompareComponent;

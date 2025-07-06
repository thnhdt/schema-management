import {
  UnorderedListOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import '../../App.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { getAllUpdateFunction } from '../../api';
import { Card, List, Typography, Spin, Flex, Tag, Space } from 'antd';

// const data = Array.from({ length: 23 }).map((_, i) => ({

//   href: 'https://ant.design',
//   title: `ant design part ${i}`,
//   avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
//   description:
//     'Ant Design, a design language for background applications, is refined by Ant UED Team.',
//   content:
//     'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
// }));
const enumTypeColor = {
  'CREATE': 'green',
  'UPDATE': 'purple',
  "DELETE": 'red'
}
const FunctionCompareComponent = () => {
  // Thêm hàm tiện ích để bổ sung columnCount cho tables
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetDatabaseId = searchParams.get('targetDatabaseId');
  const currentDatabaseId = searchParams.get('currentDatabaseId');
  const { Title, Paragraph } = Typography;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState([]);
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState(null);


  const handleGetDetailUpdate = (key, ddlPrimeFunction, ddlSecondFunction, patch, currentDatabase, targetDatabase) => {
    navigate('/compare/detail', {
      state: {
        key,
        ddlPrimeFunction,
        ddlSecondFunction,
        patch,
        currentDatabase,
        targetDatabase
      }
    });
  }
  useEffect(() => {
    fetchUpdate();
  }, [])
  const fetchUpdate = async () => {
    try {
      //thêm datbase id vào
      const data = await getAllUpdateFunction(targetDatabaseId, currentDatabaseId);
      setUpdateData(data.metaData.resultUpdate);
      setCurrentDatabase(data.metaData.currentDatabase);
      setTargetDatabase(data.metaData.targetDatabase);
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false);
    }
  }
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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Title level={2}>
          <UnorderedListOutlined />  Danh sách cập nhật function
        </Title>
      </div>
      <Card title="Những cập nhật gần đây">
        <List
          itemLayout="vertical"
          size="large"
          pagination={false}
          dataSource={updateData}
          renderItem={item => (
            <List.Item
              key={item.key}
              onClick={() => handleGetDetailUpdate(item.key,
                item.ddlPrimeFunction,
                item.ddlSecondFunction,
                item.patch,
                currentDatabase,
                targetDatabase)}
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
                    title={item.key}
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
      </Card>
    </div>

  );
}

export default FunctionCompareComponent;

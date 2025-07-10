import {
  UnorderedListOutlined,
  LoadingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { getAllUpdateFunction } from '../../api';
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
const FunctionCompareComponent = ({ targetDatabaseId, currentDatabaseId, setAllUpdateFunction }) => {
  const { Paragraph } = Typography;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState([]);
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState(null);


  const handleGetDetailUpdate = (key, ddlPrimeFunction, ddlSecondFunction, patch, currentDatabase, targetDatabase) => {
    navigate('/compare/detail', {
      state: {
        key,
        ddlSecond: ddlSecondFunction,
        ddlPrime: ddlPrimeFunction,
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
      setLoading(true);
      const data = await getAllUpdateFunction(targetDatabaseId, currentDatabaseId);
      setUpdateData(data.metaData.resultUpdate);
      setCurrentDatabase(data.metaData.currentDatabase);
      setTargetDatabase(data.metaData.targetDatabase);
      setAllUpdateFunction(data.metaData.allPatchDdl);
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
    <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto' }}>
      <List
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={updateData}
        // style={{ overflowY: 'auto' }}
        renderItem={item => (
          <List.Item
            key={item.key}
            onClick={() => handleGetDetailUpdate(
              `${enumTypeTitle[item.type]} ${item.key}`,
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

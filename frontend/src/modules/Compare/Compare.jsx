import React from 'react';
import { Typography, Row, Col, Card, Layout, Space } from 'antd';
import { useLocation } from 'react-router-dom';
import DiffViewer from "./DiffViewer";

const { Title } = Typography;
const { Content } = Layout;
const CompareComponent = () => {
  const location = useLocation();
  const {
    key,
    ddlPrimeFunction = '',
    ddlSecondFunction = '',
    patch = '',
    targetDatabase = '',
    currentDatabase = ''
  } = location.state ?? {};
  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Content style={{ maxWidth: 1440, margin: '0 auto', padding: '2rem' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            {key}
          </Title>

          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={16} style={{ display: 'flex' }}>
              <Card
                title="So sánh function"
                bordered={false}
                style={{ flex: 1 }}
                bodyStyle={{ height: '100%', overflow: 'auto', padding: 0 }}
              >
                <DiffViewer useDarkTheme={false}
                  oldText={ddlPrimeFunction}
                  newText={ddlSecondFunction}
                  filePrimeTitle={targetDatabase}
                  fileSecondTitle={currentDatabase}
                  styles={{
                    variables: {
                      light: {
                        diffViewerBackground: '#ffffff',
                        addedBackground: '#e6ffed',
                        removedBackground: '#ffeef0',
                      },
                    },
                  }} />
              </Card>
            </Col>

            <Col xs={24} md={8} style={{ display: 'flex' }}>
              <Card
                title="SQL Thay đổi"
                style={{ flex: 1 }}
                bodyStyle={{
                  overflow: 'auto',
                  height: '100%',
                  padding: '1rem',
                  background: '#2d2d2d',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    color: '#fff',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
                    fontSize: '0.9rem',
                  }}
                >
                  {patch}
                </pre>
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  );
};

export default CompareComponent;

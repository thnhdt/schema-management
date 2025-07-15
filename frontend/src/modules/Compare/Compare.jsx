import React from 'react';
import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Typography, Row, Col, Card, Layout, Space, Button } from 'antd';
import DiffViewer from "./DiffViewer";

const { Title } = Typography;
const { Content } = Layout;
const CompareComponent = ({ title, ddlPrime = '', ddlSecond = '', patch = '', targetDatabase = '', currentDatabase = '', onBack }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Content style={{ maxWidth: 1440, margin: '0 auto', padding: '2rem', fontSize: '0.9rem' }}>
        <Button onClick={onBack} style={{ marginBottom: 16 }}>
          ← Quay lại
        </Button>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0, fontSize: '1.2rem' }}>
            {title}
          </Title>
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={16} style={{ display: 'flex' }}>
              <Card
                bordered={false}
                style={{ flex: 1, fontFamily: 'system-ui' }}
                bodyStyle={{ height: '100%', overflow: 'auto', padding: 0 }}
              >
                <DiffViewer useDarkTheme={false}
                  oldText={ddlPrime}
                  newText={ddlSecond}
                  filePrimeTitle={targetDatabase}
                  fileSecondTitle={currentDatabase}
                  styles={{
                    fontFamily: 'system-ui',
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
                title={<span style={{ fontSize: '1rem' }}>SQL Thay đổi</span>}
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
                    fontFamily: 'system-ui',
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

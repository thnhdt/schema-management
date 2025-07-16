import React from 'react';
import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Typography, Row, Col, Card, Layout, Space, Button, message, Modal } from 'antd';
// import { useLocation, useNavigate } from 'react-router-dom';
import DiffViewer from "./DiffViewer";
const { Title } = Typography;
const { Content } = Layout;
const CompareComponent = ({ title, ddlPrime = '', ddlSecond = '', patch = '', targetDatabase = '', currentDatabase = '', onBack }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showSqlModal, setShowSqlModal] = React.useState(false);
  const handleShowSql = () => setShowSqlModal(true);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(patch);
      messageApi.success('Đã copy SQL thay đổi!');
    } catch {
      messageApi.error('Copy không thành công!');
    }
  };
  return (
    <>
      {contextHolder}
      <Modal
        open={showSqlModal}
        onCancel={() => setShowSqlModal(false)}
        footer={null}
        width={700}
        title="SQL thay đổi"
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button type="primary" onClick={handleCopy}>
            Copy SQL thay đổi
          </Button>
        </div>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'Menlo, Consolas, "Courier New", monospace',
          fontSize: '0.95rem',
          margin: 0,
          padding: '1rem',
          border: '1px solid #eee',
          borderRadius: 8,
          background: '#f7f7f7',
          maxHeight: 400,
          overflow: 'auto',
        }}>
          {patch}
        </pre>
      </Modal>
      <Layout style={{ minHeight: '80vh', background: '#fafafa' }}>
        {/* <Content style={{ maxWidth: '100vw', height: '100vh', margin: 0, padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column' }}> */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem 2rem 1rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button onClick={onBack} style={{ marginBottom: 0 }}>
                ← Quay lại
              </Button>
              <Title level={2} style={{ margin: 0, fontSize: '1.2rem' }}>
                {title}
              </Title>
            </div>
            <Button type="primary" onClick={handleShowSql}>
              Xem SQL thay đổi
            </Button>
          </div>
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, padding: '0 2rem 2rem 2rem', display: 'flex', flexDirection: 'column' }}>
            <Card
              bordered={false}
              style={{ flex: 1, fontFamily: 'system-ui', height: '100%' }}
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
          </div>
        {/* </Content> */}
      </Layout>
    </>
  );
};

export default CompareComponent;

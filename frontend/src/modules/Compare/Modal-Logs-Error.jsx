import { Card, message, Tag } from "antd";

import { ModalComponent, TableComponent } from "../../util/helper";
import { SwapOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';

import '../../App.css';
const ModalLogErrorComponent = (props) => {
  const { onCancel, visible, log = [] } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const hanldeCopyText = () => {
    navigator.clipboard.writeText(log);
    messageApi.open({
      type: 'success',
      content: 'Copy thành công',
    });
  }

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
          <div style={{ marginTop: '1.5rem' }}>
            <Card
              title="Terminal Log lỗi"
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
                {log}
              </pre>
            </Card>
          </div>

        )}
      />
    </>

  );
};

export default ModalLogErrorComponent
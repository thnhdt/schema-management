
import { Card, message, FloatButton } from "antd";
import { SwapOutlined } from '@ant-design/icons';
import { DrawerComponent } from "../../util/helper";
import '../../App.css'
const DrawerCompareComponent = (props) => {
  const { onClose, open, allUpdateFunction, allUpdateDdlTable } = props;
  const [_, contextHolder] = message.useMessage();
  const allDdlUpdateSchema = '-- Cập nhật trên Function' + '\n' + allUpdateFunction + '\n' + '-- Cập nhật trên Table' + '\n' + allUpdateDdlTable;
  return (
    <>
      {contextHolder}
      <DrawerComponent
        onClose={onClose}
        open={open}
        Component={(
          <>
            <div>
              <Card
                title="Tất cả Cập nhật"
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
                  {allDdlUpdateSchema}
                </pre>
              </Card>

            </div>
            <FloatButton size='large' className='add-btn' icon={<SwapOutlined />} style={{ insetInlineEnd: 24 }} />
          </>
        )}
      />
    </>
  );
};

export default DrawerCompareComponent
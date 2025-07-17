
import { Card, message, FloatButton } from "antd";
import { SwapOutlined, FunctionOutlined, TableOutlined, CustomerServiceOutlined, CopyOutlined } from '@ant-design/icons';
import { DrawerComponent } from "../../util/helper";
import { syncDatabase } from "../../api/table";
import { useState } from "react";
import '../../App.css'

const DrawerCompareAllComponent = (props) => {
  const { onClose, open, allUpdateFunction, allUpdateDdlTable, targetDatabaseId, currentDatabaseId, onRefetchTable, onRefetchFunction } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [floatButtonOpen, setFloatButtonOpen] = useState(false);
  const allDdlUpdateSchema = '-- Cập nhật trên Function' + '\n' + allUpdateFunction + '\n' + '-- Cập nhật trên Table' + '\n' + allUpdateDdlTable;
  const hanldeCopyText = () => {
      navigator.clipboard.writeText(allDdlUpdateSchema);
    messageApi.open({
      type: 'success',
      content: 'Copy thành công',
    });
  }
  const handleUpdateDatabase = async (isFunction, isTable) => {
    try {
      messageApi.loading({ content: 'Đang cập nhật database...', key: 'update' });
      if (isFunction && isTable) {
        await syncDatabase(
          targetDatabaseId,
          currentDatabaseId,
          allUpdateFunction,
          allUpdateDdlTable
        );
        onRefetchTable();
        onRefetchFunction();
      }
      else if (isFunction && !isTable) {
        await syncDatabase(
          targetDatabaseId,
          currentDatabaseId,
          allUpdateFunction,
          ''
        );
        onRefetchFunction();
      } else {
        await syncDatabase(
          targetDatabaseId,
          currentDatabaseId,
          '',
          allUpdateDdlTable
        );
        onRefetchTable();
      }
      messageApi.success({
        content: 'Cập nhật database thành công!',
        key: 'update',
        duration: 3
      });
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật database:', error);
      messageApi.error({
        content: `${error.response.data.error.message}`,
        key: 'update',
        duration: 5
      });
    }
  };

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
            <FloatButton.Group
              open={floatButtonOpen}
              placement='left'
              shape="circle"
              trigger="hover"
              style={{ insetInlineEnd: 24 }}
              icon={<SwapOutlined />}
              onOpenChange={setFloatButtonOpen}
              className='main-float-btn'
            >
              <FloatButton
                className='add-btn'
                icon={<FunctionOutlined />}
                style={{ insetInlineEnd: 24 }}
                onClick={() => handleUpdateDatabase(true, false)}
                tooltip="Cập nhật function"
              />
              <FloatButton
                className='add-btn'
                icon={<TableOutlined />}
                style={{ insetInlineEnd: 24 }}
                onClick={() => handleUpdateDatabase(false, true)}
                tooltip="Cập nhật table"
              />
              <FloatButton
                className='add-btn'
                icon={<SwapOutlined />}
                style={{ insetInlineEnd: 24 }}
                onClick={() => handleUpdateDatabase(true, true)}
                tooltip="Cập nhật toàn bộ"
              />
              <FloatButton
                className='add-btn'
                icon={< CopyOutlined/>}
                style={{ insetInlineEnd: 24 }}
                onClick={() => hanldeCopyText()}
                tooltip="Copy text"
              />
            </FloatButton.Group >
          </>
        )}
      />
    </>
  );
};

export default DrawerCompareAllComponent
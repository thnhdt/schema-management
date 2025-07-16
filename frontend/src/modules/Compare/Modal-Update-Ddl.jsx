import { Card, message, Drawer, Button } from "antd";
import { SwapOutlined, FunctionOutlined, TableOutlined, CustomerServiceOutlined, CopyOutlined } from '@ant-design/icons';
import { DrawerComponent } from "../../util/helper";
import { syncDatabase } from "../../api/table";
import '../../App.css'

const DrawerCompareComponent = (props) => {
  const { onClose, open, targetDatabaseId, currentDatabaseId, onRefetchTable, onRefetchFunction, selectedTables = [], selectedFunctions = [], updateData = [], functionUpdateData = [] } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const selectedTableObjs = updateData.filter(item => selectedTables.includes(item.key));
  const selectedFunctionObjs = functionUpdateData.filter(item => selectedFunctions.includes(item.key));

  const handleSyncSelected = async () => {
    try {
      messageApi.loading({ content: 'Đang cập nhật database...', key: 'update' });
      const patchFunction = selectedFunctionObjs.map(fn => fn.patch).join('\n');
      const patchTable = selectedTableObjs.map(tb => Array.isArray(tb.stmts) ? tb.stmts.join('\n') : (tb.stmts ?? '')).join('\n');
      await syncDatabase(
        targetDatabaseId,
        currentDatabaseId,
        patchFunction,
        patchTable
      );
      await onRefetchTable();
      await onRefetchFunction();
      messageApi.success({
        content: 'Cập nhật database thành công!',
        key: 'update',
        duration: 3
      });
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật database:', error);
      messageApi.error({
        content: error?.response?.data?.error?.message || 'Có lỗi xảy ra!',
        key: 'update',
        duration: 5
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title="Xác nhận đồng bộ các mục đã chọn"
        placement="right"
        onClose={onClose}
        open={open}
        width={480}
      >
        <div style={{ marginBottom: 16 }}>
          <b>Function đã chọn:</b>
          <ul>
            {selectedFunctionObjs.length === 0 && <li><i>Không có</i></li>}
            {selectedFunctionObjs.map(fn => (
              <li key={fn.key}>{fn.key}</li>
            ))}
          </ul>
          <b>Table đã chọn:</b>
          <ul>
            {selectedTableObjs.length === 0 && <li><i>Không có</i></li>}
            {selectedTableObjs.map(tb => (
              <li key={tb.key}>{tb.key}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={handleSyncSelected} disabled={selectedFunctionObjs.length === 0 && selectedTableObjs.length === 0}>
            Xác nhận đồng bộ
          </Button>
          <Button onClick={onClose}>
            Hủy
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default DrawerCompareComponent
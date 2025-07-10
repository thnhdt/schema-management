import { Table, Space, Button, Typography, Flex, Spin, Row, Col, Modal, Drawer } from 'antd';
import '../App.css';
export const TableComponent = (props) => {
  const { customButton, columns, data, title, rowClassName = () => 'no-hover', loading = null, size = null, onRow = undefined, scroll = undefined } = props
  return (
    <>
      <Table
        title={() => (
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              {customButton}
            </Col>
          </Row>
        )}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={scroll}
        loading={loading}
        bordered
        rowClassName={rowClassName}
        size={size}
        style={{ minWidth: '50%' }}
        onRow={onRow}
        className="custom-table-spacing"
      />
    </>
  )
};

export const ModalComponent = ({ onCancel, onOk = null, open = null, title, Component, okText = null, footer = undefined, width = undefined }) => {
  return (
    <Modal
      width={width}
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelButtonProps={{ style: { display: 'none' } }}
      getContainer={false}
      centered
      footer={footer}
    >
      {Component}
    </Modal>
  );
};


export const DrawerComponent = ({ onClose, open, Component }) => {
  return (
    <Drawer width={'40vw'} placement="right" closable={false} onClose={onClose} open={open}>
      {Component}
    </Drawer>
  )
}
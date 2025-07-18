import { Table, Space, Button, Typography, Flex, Spin, Row, Col, Modal } from 'antd';
export const TableComponent = (props) => {
  const { customButton, columns, data, title, rowClassName = null, loading = null, size = null } = props
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
        scroll={{ x: 'max-content' }}
        loading={loading}
        bordered
        rowClassName={rowClassName}
        size={size}
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

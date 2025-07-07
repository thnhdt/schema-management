import React, { useState, useEffect } from "react";
import { Space, Select, Card, Typography, Form, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllNodes, getAllDatabaseInHost } from "../../api";
import { ModalComponent } from "../../util/helper";
import { SwapOutlined, DatabaseOutlined } from '@ant-design/icons';

const ModalCompareComponent = (props) => {
  const { onCancel, visible } = props;
  const navigate = useNavigate();
  const [optionHost, setOptionHost] = useState([]);
  const [optionTargetDatabase, setOptionTargetDatabase] = useState([]);
  const [optionCurrentDatabase, setOptionCurrentDatabase] = useState([]);
  const [selectedCurrentHost, setSelectedCurrentHost] = useState(null);
  const [_, setSelectedTargetHost] = useState(null);
  const [selectedTargetDb, setSelectedTargetDb] = useState(null);
  const [selectedCurrentDb, setSelectedCurrentDb] = useState(null);
  const [compareType, setCompareType] = useState('function');
  const compareTypeOptions = [
    { value: 'function', label: 'Functions' },
    { value: 'table', label: 'Tables' },
  ];
  const onOk = () => {
    navigate(
      `/compare/${compareType}?` +
      `targetDatabaseId=${selectedTargetDb}&currentDatabaseId=${selectedCurrentDb}`
    );
    console.log("Chuyển tới trang so sánh");
  }
  useEffect(() => {
    fetchData();
  }, [])
  const fetchData = async () => {
    try {
      const response = await getAllNodes();
      const data = response.metaData.metaData.node.map(item => ({
        value: item._id,
        label: `${item.host}:${item.port}`
      }));
      setOptionHost(data);
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleChangeCurrentDb = async (value) => {
    try {
      const response = await getAllDatabaseInHost(value);
      const data = response.metaData.metaData.database.map(item => ({
        value: item._id,
        label: `${item.username}:${item.name}`
      }));
      setOptionCurrentDatabase(data);
      setSelectedCurrentHost(value)
    } catch (error) {
      console.error(error.message);
    }
  }

  const handleChangeTargetDb = async (value) => {
    try {
      const response = await getAllDatabaseInHost(value);
      let data = response.metaData.metaData.database.map(item => ({
        value: item._id,
        label: `${item.username}:${item.name}`
      }));
      if (selectedCurrentHost === value) {
        data = data.filter(item => item.value !== selectedCurrentDb);
      }
      setOptionTargetDatabase(data);
      setSelectedTargetHost(value);
    } catch (error) {
      console.error(error.message);
    }
  }
  return (
    <ModalComponent
      onCancel={onCancel}
      width={'60%'}
      onOk={onOk}
      open={visible}
      okText={'So sánh'}
      Component={(
        <Card
          title={
            <Space>
              <SwapOutlined style={{ fontSize: 20 }} />
              <span>Database Diff</span>
            </Space>
          }
          style={{ width: "100%", margin: '1.5rem auto', boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}
        >
          <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Chọn <strong>database hiện tại</strong> và <strong>database đích</strong> để tiếp tục thao tác.
          </Typography.Paragraph>

          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label="Loại so sánh">
                  <Select
                    value={compareType}
                    options={compareTypeOptions}
                    onChange={setCompareType}
                    dropdownStyle={{ borderRadius: 12 }}
                    style={{ maxWidth: '8rem' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} >
              <Col xs={24} sm={12}>
                <Form.Item
                  name="currentDb"
                  label="Current Database"
                  rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
                >
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Select
                      style={{ flex: 1, minWidth: 0 }}
                      size="medium"
                      placeholder="Chọn host đích"
                      suffixIcon={<DatabaseOutlined />}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionHost}
                      onChange={(value) => handleChangeCurrentDb(value)}
                    />
                    <Select
                      style={{ flex: 1, minWidth: 0 }}
                      size="medium"
                      placeholder="Chọn database đích"
                      suffixIcon={<DatabaseOutlined />}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionCurrentDatabase}
                      onChange={(value) => setSelectedCurrentDb(value)}
                    />
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} >
                <Form.Item
                  name="targetDb"
                  label="Target Database"
                  rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
                >
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Select
                      style={{ flex: 1, minWidth: 0 }}
                      size="medium"
                      placeholder="Chọn host hiện tại"
                      suffixIcon={<DatabaseOutlined />}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionHost}
                      onChange={(value) => handleChangeTargetDb(value)}
                    />
                    <Select
                      style={{ flex: 1, minWidth: 0 }}           // chiếm nửa phải
                      size="medium"
                      placeholder="Chọn database hiện tại"
                      suffixIcon={<DatabaseOutlined />}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionTargetDatabase}
                      onChange={(value) => setSelectedTargetDb(value)}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
    />
  );
};

export default ModalCompareComponent
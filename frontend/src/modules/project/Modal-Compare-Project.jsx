import React, { useState, useEffect, useRef } from "react";
import { Space, Select, Card, Typography, Form, Row, Col, message, Divider, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllDatabasesAll } from '../../api/database';
import { getProjectPrefixes, getAllProject } from '../../api/project';
import { ModalComponent } from "../../util/helper";
import { SwapOutlined, DatabaseOutlined, PlusOutlined  } from '@ant-design/icons';

const ModalCompareProjectComponent = (props) => {
  const { onCancel, visible, projectId } = props;
  const navigate = useNavigate();
  const [optionDatabases, setOptionDatabases] = useState([]);
  const [selectedTargetDb, setSelectedTargetDb] = useState(null);
  const [selectedCurrentDb, setSelectedCurrentDb] = useState(null);
  const [, contextHolder] = message.useMessage();
  const [tablePrefixes, setTablePrefixes] = useState([]);
  const [functionPrefixes, setFunctionPrefixes] = useState([]);
  const [selectedTablePrefixes, setSelectedTablePrefixes] = useState([]);
  const [selectedFunctionPrefixes, setSelectedFunctionPrefixes] = useState([]);
  const [tableInput, setTableInput] = useState('');
  const [functionInput, setFunctionInput] = useState('');
  const tableInputRef = useRef(null);
  const functionInputRef = useRef(null);

  useEffect(() => {
    if (visible && projectId) {
      (async () => {
        try {
          const allProjects = await getAllProject();
          const project = (allProjects.metaData || []).find(p => p._id === projectId);
          if (project && Array.isArray(project.databaseId)) {
            const allDbsRes = await getAllDatabasesAll();
            const allDbs = allDbsRes.metaData || [];
            const dbOptions = project.databaseId.map(dbId => {
              const db = allDbs.find(d => d._id === dbId);
              return db ? { value: db._id, label: `${db.username ? db.username + ':' : ''}${db.name}` } : { value: dbId, label: dbId };
            });
            setOptionDatabases(dbOptions);
          } else {
            setOptionDatabases([]);
          }
          const prefixRes = await getProjectPrefixes(projectId);
          setTablePrefixes(prefixRes.metaData.tablePrefix || []);
          setFunctionPrefixes(prefixRes.metaData.functionPrefix || []);
        } catch {
          setOptionDatabases([]);
          setTablePrefixes([]);
          setFunctionPrefixes([]);
        }
      })();
    }
  }, [visible, projectId]);

  const onOk = () => {
    navigate(
      `/compare?` +
      `targetDatabaseId=${selectedTargetDb}&currentDatabaseId=${selectedCurrentDb}` +
      `&tablePrefixes=${encodeURIComponent(selectedTablePrefixes.join(','))}` +
      `&functionPrefixes=${encodeURIComponent(selectedFunctionPrefixes.join(','))}`
    );
  }

  let indexTable = 0;
  const onPrefixChangeTable = event => {
    setTableInput(event.target.value);
  };
  const addItemTable = e => {
    e.preventDefault();
    setTablePrefixes([...tablePrefixes, tableInput || `New item ${indexTable++}`]);
    setTableInput('');
    setTimeout(() => {
      var _a;
      (_a = tableInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, 0);
  };
  let indexFunction = 0;
  const onPrefixChangeFunction = event => {
    setFunctionInput(event.target.value);
  };
  const addItemFunction = e => {
    e.preventDefault();
    setFunctionPrefixes([...functionPrefixes, functionInput || `New item ${indexFunction++}`]);
    setFunctionInput('');
    setTimeout(() => {
      var _a;
      (_a = functionInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, 0);
  };

  return (
    <>
      {contextHolder}
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
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="currentDb"
                    label="Current Database"
                    rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
                  >
                    <Select
                      style={{ width: '100%' }}
                      size="medium"
                      placeholder="Chọn database hiện tại"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionDatabases}
                      onChange={setSelectedCurrentDb}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="targetDb"
                    label="Target Database"
                    rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
                  >
                    <Select
                      style={{ width: '100%' }}
                      size="medium"
                      placeholder="Chọn database đích"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: 12 }}
                      options={optionDatabases.filter(opt => opt.value !== selectedCurrentDb)}
                      onChange={setSelectedTargetDb}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Tiền tố cho Table">
                    <Select
                      mode="multiple"
                      placeholder="Tiền tố cho Table"
                      style={{ width: '100%' }}
                      popupRender={menu => (
                        <>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <Space style={{ padding: '0 8px 4px' }}>
                            <Input
                              placeholder="Thêm tiền tố"
                              ref={tableInputRef}
                              value={tableInput}
                              onChange={onPrefixChangeTable}
                              onKeyDown={e => e.stopPropagation()}
                            />
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={addItemTable}
                            >
                              Add item
                            </Button>
                          </Space>
                        </>
                      )}
                      options={tablePrefixes.map(item => ({ label: item, value: item }))}
                      value={selectedTablePrefixes}
                      onChange={setSelectedTablePrefixes}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Tiền tố cho Function">
                    <Select
                      mode="multiple"
                      placeholder="Tiền tố cho Function"
                      style={{ width: '100%' }}
                      popupRender={menu => (
                        <>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <Space style={{ padding: '0 8px 4px' }}>
                            <Input
                              placeholder="Thêm tiền tố"
                              ref={functionInputRef}
                              value={functionInput}
                              onChange={onPrefixChangeFunction}
                              onKeyDown={e => e.stopPropagation()}
                            />
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={addItemFunction}
                            >
                              Add item
                            </Button>
                          </Space>
                        </>
                      )}
                      options={functionPrefixes.map(item => ({ label: item, value: item }))}
                      value={selectedFunctionPrefixes}
                      onChange={setSelectedFunctionPrefixes}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}
      />
    </>
  );
};

export default ModalCompareProjectComponent;
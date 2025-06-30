import React, { useState, useCallback } from 'react';
import { Button, Upload, message, Card, Space, Typography, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ERDNode from './ERDNode.jsx';
import ERDEdge from './ERDEdge.jsx';
import axios from 'axios';

const { Title, Text } = Typography;

const nodeTypes = {
  erdNode: ERDNode,
};

const edgeTypes = {
  erdEdge: ERDEdge,
};

const SQLToERD = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sqlScript, setSqlScript] = useState('');

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setSqlScript(content);
      message.success('SQL file uploaded successfully!');
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  const handleTextAreaChange = (e) => {
    setSqlScript(e.target.value);
  };

  const generateERD = async () => {
    if (!sqlScript.trim()) {
      message.error('Please provide SQL script first!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/parse-sql', {
        sqlScript: sqlScript
      });

      const { nodes: erdNodes, edges: erdEdges } = response.data;
      
      // Transform nodes for React Flow
      const flowNodes = erdNodes.map((node, index) => ({
        id: node.id,
        type: 'erdNode',
        position: node.position || { x: index * 300, y: index * 200 },
        data: { 
          label: node.name,
          columns: node.columns,
          tableName: node.name
        }
      }));

      // Transform edges for React Flow
      const flowEdges = erdEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'erdEdge',
        data: {
          sourceColumn: edge.sourceColumn,
          targetColumn: edge.targetColumn,
          type: edge.type
        }
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      message.success('ERD generated successfully!');
    } catch (error) {
      console.error('Error generating ERD:', error);
      message.error('Failed to generate ERD. Please check your SQL syntax.');
    } finally {
      setLoading(false);
    }
  };

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => nds.map((node) => {
      const change = changes.find((c) => c.id === node.id);
      if (change) {
        return { ...node, position: change.position || node.position };
      }
      return node;
    }));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => eds.map((edge) => {
      const change = changes.find((c) => c.id === edge.id);
      if (change) {
        return { ...edge, ...change };
      }
      return edge;
    }));
  }, []);

  const exportAsImage = () => {
    // Implementation for exporting as image
    message.info('Export feature will be implemented soon!');
  };

  const loadSampleSQL = () => {
    const sampleSQL = `
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  user_id INTEGER NOT NULL,
  category_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);`;
    setSqlScript(sampleSQL);
    message.success('Sample SQL loaded!');
  };

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Card>
        <Title level={3}>SQL to ERD Generator</Title>
        <Text type="secondary">Upload SQL script or paste it to generate Entity Relationship Diagram</Text>
        
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Upload
              accept=".sql"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload SQL File</Button>
            </Upload>
            
            <Button onClick={loadSampleSQL} type="dashed">
              Load Sample SQL
            </Button>
            
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={generateERD}
              loading={loading}
            >
              Generate ERD
            </Button>
            
            <Button 
              icon={<DownloadOutlined />}
              onClick={exportAsImage}
              disabled={nodes.length === 0}
            >
              Export as Image
            </Button>
          </Space>
          
          <textarea
            value={sqlScript}
            onChange={handleTextAreaChange}
            placeholder="Paste your SQL script here or upload a file..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </Space>
      </Card>

      {nodes.length > 0 && (
        <div style={{ flex: 1, marginTop: '20px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};

export default SQLToERD; 
import React from 'react';
import { getBezierPath } from '@xyflow/react';

const ERDEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { sourceColumn, targetColumn, type } = data || {};

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: type === 'foreign_key' ? '#1890ff' : '#666',
          strokeDasharray: type === 'foreign_key' ? 'none' : '5,5',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Relationship label */}
      {sourceColumn && targetColumn && (
        <foreignObject
          width={120}
          height={40}
          x={labelX - 60}
          y={labelY - 20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            style={{
              background: 'white',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              textAlign: 'center',
              fontFamily: 'monospace',
              color: '#1890ff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {sourceColumn} → {targetColumn}
          </div>
        </foreignObject>
      )}
      
      {/* Arrow marker for foreign key */}
      {type === 'foreign_key' && (
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#1890ff"
            />
          </marker>
        </defs>
      )}
    </>
  );
};

export default ERDEdge; 
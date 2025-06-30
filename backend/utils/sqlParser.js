// SQL Parser utility để extract table structure và relationships
export function parseSQL(sqlScript) {
  const tables = [];
  const relationships = [];
  
  // Normalize SQL script
  const normalizedSQL = sqlScript
    .replace(/\s+/g, ' ')
    .replace(/--.*$/gm, '') // Remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim();

  // Split by CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]*?)\)\s*;?/gi;
  
  let match;
  while ((match = createTableRegex.exec(normalizedSQL)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];
    
    const columns = parseColumns(tableBody);
    const foreignKeys = parseForeignKeys(tableBody);
    
    tables.push({
      id: tableName,
      name: tableName,
      columns: columns,
      position: { x: Math.random() * 800, y: Math.random() * 600 }
    });
    
    // Add relationships from foreign keys
    foreignKeys.forEach(fk => {
      relationships.push({
        id: `${tableName}_${fk.referencedTable}`,
        source: tableName,
        target: fk.referencedTable,
        sourceColumn: fk.column,
        targetColumn: fk.referencedColumn,
        type: 'foreign_key'
      });
    });
  }
  
  return {
    nodes: tables,
    edges: relationships
  };
}

function parseColumns(tableBody) {
  const columns = [];
  
  // Split by commas, but be careful with nested parentheses
  const columnDefinitions = splitColumnDefinitions(tableBody);
  
  columnDefinitions.forEach(def => {
    const trimmedDef = def.trim();
    
    // Skip if it's a constraint definition (FOREIGN KEY, PRIMARY KEY, etc.)
    if (trimmedDef.toUpperCase().startsWith('FOREIGN KEY') || 
        trimmedDef.toUpperCase().startsWith('PRIMARY KEY') ||
        trimmedDef.toUpperCase().startsWith('UNIQUE') ||
        trimmedDef.toUpperCase().startsWith('CHECK')) {
      return;
    }
    
    // Match column definition: name type [constraints]
    const columnMatch = trimmedDef.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z]+(?:\s*\(\s*\d+(?:\s*,\s*\d+)?\s*\))?)(?:\s+(.+))?/i);
    
    if (columnMatch) {
      const [, columnName, dataType, constraints] = columnMatch;
      const constraintText = constraints || '';
      
      columns.push({
        name: columnName,
        type: dataType.toUpperCase(),
        isPrimaryKey: constraintText.toUpperCase().includes('PRIMARY KEY') || false,
        isNullable: !constraintText.toUpperCase().includes('NOT NULL'),
        defaultValue: extractDefaultValue(constraintText)
      });
    }
  });
  
  return columns;
}

function parseForeignKeys(tableBody) {
  const foreignKeys = [];
  
  // Match FOREIGN KEY constraints
  const fkRegex = /FOREIGN\s+KEY\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s+REFERENCES\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/gi;
  
  let match;
  while ((match = fkRegex.exec(tableBody)) !== null) {
    foreignKeys.push({
      column: match[1],
      referencedTable: match[2],
      referencedColumn: match[3]
    });
  }
  
  return foreignKeys;
}

function splitColumnDefinitions(tableBody) {
  const definitions = [];
  let current = '';
  let parenCount = 0;
  
  for (let i = 0; i < tableBody.length; i++) {
    const char = tableBody[i];
    
    if (char === '(') parenCount++;
    else if (char === ')') parenCount--;
    else if (char === ',' && parenCount === 0) {
      definitions.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current.trim()) {
    definitions.push(current.trim());
  }
  
  return definitions;
}

function extractDefaultValue(constraints) {
  if (!constraints) return null;
  
  const defaultMatch = constraints.match(/DEFAULT\s+([^,\s]+(?:\s+[^,\s]+)*)/i);
  return defaultMatch ? defaultMatch[1].trim() : null;
}

// Helper function để generate sample SQL cho testing
export function generateSampleSQL() {
  return `
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
    );
  `;
} 
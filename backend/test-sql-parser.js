import { parseSQL, generateSampleSQL } from './utils/sqlParser.js';

// Test với sample SQL
const sampleSQL = generateSampleSQL();
console.log('Sample SQL:');
console.log(sampleSQL);
console.log('\n' + '='.repeat(50) + '\n');

// Parse SQL
const result = parseSQL(sampleSQL);
console.log('Parsed Result:');
console.log(JSON.stringify(result, null, 2));

// Test với SQL đơn giản
const simpleSQL = `
CREATE TABLE test_table (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

console.log('\n' + '='.repeat(50) + '\n');
console.log('Simple SQL Test:');
const simpleResult = parseSQL(simpleSQL);
console.log(JSON.stringify(simpleResult, null, 2)); 
const { Sequelize } = require("sequelize")
var fs = require('fs');
const sequelize = new Sequelize("project_intern", "guest", "12345", {
  host: "localhost",
  dialect: 'postgres',
  port: 5432
})

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

const close = () => {
  sequelize.close()
}
const mapFunction = {
  "get_all_users_by_email_into_cursor": "getAllUsers",
  "get_all_users_by_email_into_cursor_1": "getAllUsers1"
}
const map = {
  'integer': "DataTypes.INTEGER",
  'boolean': "DataTypes.BOOLEAN",
  'character varying': "DataTypes.STRING",
  'date': "DataTypes.DATE",
  'text': "DataTypes.TEXT"
}
const getAllFunctionInDB = async (schema_name) => {
  const results = await sequelize.query(`SELECT proname AS function_name,
       pg_get_functiondef(p.oid) AS function_definition,
       n.nspname AS schema_name,
       pg_catalog.pg_get_function_arguments(p.oid) AS arguments,
       pg_catalog.format_type(p.prorettype, NULL) AS return_type
       FROM pg_proc p
       LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname = ?
       ORDER BY schema_name, function_name;`, {
    replacements: [schema_name],
    raw: true // Use replacements to safely pass parameters
  })
  close()
  return results[0]
}
const contentFileFuntion = (object) => {
  return `module.exports = ` + JSON.stringify(object, null, 2);
}
const contentFileModel = (object) => {
  let result = `const { Sequelize } = require("sequelize")
const Function = require('../src/test3.js')
const sequelize = new Sequelize("project_intern", "guest", "12345", {
  host: "localhost",
  dialect: 'postgres',
  port: 5432
})

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

const close = () => {
  sequelize.close()
}

connection()\n`
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const func = object[key];
      const placeholders = func.arguments.map((value) => `${value.name}`).join(',');
      let content = `export const ${key} = async(${placeholders})=>{
        const results = await sequelize.query(` + `\`
            BEGIN;
        SELECT ${func.call_function};
        FETCH ALL  from  mycursor;
        COMMIT;\`` + `, {
            replacements: [${placeholders}],
            raw: true // Use replacements to safely pass parameters
          })
          close()
          results[0].shift()
          console.log(results[0])
          return results[0]
        }`
      result += content + '\n'
    }
  }
  return result
}
const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function parseVariables(inputString) {
  // Tách chuỗi thành từng cặp bằng dấu phẩy
  const pairs = inputString.split(", ");
  const result = [];

  pairs.forEach(pair => {
    const parts = pair.trim().split(' ');
    const name = parts[0]; // Phần đầu là tên biến
    const type = parts.slice(1).join(" ");
    result.push({ name, type: map[type] });
  });
  return result;
}
const syncFuntionFromPosgresToModel = async (result, object) => {
  result.forEach((column) => {
    const {
      function_name,
      arguments,
      return_type,
      function_definition,
    } = column;
    const input = arguments;
    const types = parseVariables(input)

    const placeholders = types.map(() => '?').join(',');
    object[mapFunction[function_name]] = {
      arguments: types,
      return_type: return_type,
      call_function: `${function_name}(${placeholders})`
    };

  })
  return object
}

rl.question("Enter database and table: ", async (input) => {
  await connection();
  const result = await getAllFunctionInDB(input = 'public')

  const object = await syncFuntionFromPosgresToModel(result, {})
  // viet vao 2 file 
  fs.writeFileSync('test3.js', contentFileFuntion(object), "utf8");
  fs.writeFileSync('model.js', contentFileModel(object), "utf8");
  rl.close();
});
const { Sequelize } = require("sequelize")
var fs = require('fs');

const convertToString = (modelObject) => {
  return Object.entries(modelObject)
    .map(([key, value]) => {
      return `${key}: { type: ${value.type}, ${Object.entries(value).filter(([k]) => k !== 'type').map(([k, v]) => `${k}: ${v}`).join(',\n ')} }`;
    })
    .join(',\n')
};
const content = (object) => {
  return `
  import { sequelize } from '../config/connection.js'
  import {DataTypes, UUID } from 'sequelize';
  export const patient = sequelize.define('patient',{` + convertToString(object) + `});`
}

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

const GetDB = async (database = "", table = "") => {
  // columns
  const columns = await sequelize.query(`SELECT
    *
    FROM
  information_schema.columns
  WHERE
  table_catalog = ? AND 
    table_name =? AND
    table_schema = 'public'`, {
    replacements: [database, table],
    raw: true // Use replacements to safely pass parameters
  })
  //   const constraint = await sequelize.query(`SELECT
  //     *
  // FROM
  //     information_schema.table_constraints
  // WHERE
  //     table_catalog = ? AND 
  //     table_name =? AND
  //     table_schema = 'public'`, {
  //     replacements: [database, table],
  //     raw: true  // Use replacements to safely pass parameters
  //   })
  close()
  return columns[0]

}
const map = {
  'integer': "DataTypes.INTEGER",
  'boolean': "DataTypes.BOOLEAN",
  'character varying': "DataTypes.STRING",
  'date': "DataTypes.DATE",
  'text': "DataTypes.TEXT"
}
// const mapDataType = (dataType) => {
//   switch (dataType) {
//     case 'integer':
//       return DataTypes.INTEGER;
//     case 'timestamp with time zone':
//       return TIMESTAMP;
//     case 'character varying':
//       return DataTypes.STRING;
//     case 'boolean':
//       return DataTypes.BOOLEAN;
//     case 'date':
//       return DataTypes.DATE;
//     case 'text':
//       return DataTypes.TEXT;
//     default:
//       throw new Error("Khong dung kieu !"); // Default to string if unknown
//   }
// };
// database table  
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const deleteUndefinedField = (obj) => {
//   Object.keys(obj).forEach((key) => {
//     if (obj[key] === false && key !== 'allowNull') {
//       delete (obj[key])
//     }
//     else if (key === 'allowNull' && obj[key] === true) {
//       delete (obj[key])
//     }
//   })
//   return obj
// }
// dong bo tuwf db sang model

const syncFromPosgresToModel = async (result, object) => {
  result.forEach((column) => {
    const {
      column_name,
      data_type,
      is_nullable,
      column_default,
      is_unique,
    } = column;
    object[column_name] = {
      type: map[data_type],
      // allowNull: is_nullable === "YES" ? true : false,
      ...(is_nullable !== "YES" && { allowNull: false }),
      // unique: is_unique === 'YES' ? true : false,
      ...(is_unique === "YES" && { unique: true }),
      // primaryKey: column_default ? column_default.includes('nextval') : false,
      ...(column_default?.includes('nextval') && { primaryKey: column_default.includes('nextval') }),
      // autoIncrement: column_default ? column_default.includes('nextval') : false
      ...(column_default?.includes('nextval') && { autoIncrement: column_default.includes('nextval') }),
    };
    // object[column_name] = deleteUndefinedField(object[column_name])

    if (column_default && !column_default.includes('nextval')) {
      const defaultValueMatch = column_default.match(/'(.+)'/);
      if (defaultValueMatch && defaultValueMatch[1]) {
        object[column_name].defaultValue = defaultValueMatch[1];
      }
    }
  })
  return object
}
rl.question("Enter database and table: ", async (input) => {
  const [database, table] = input.split(' '); // Split input by space
  console.log(`Hi ${database}! You are ${table} years old.`);
  await connection();
  const result = await GetDB(database, table)

  const object = await syncFromPosgresToModel(result, {})
  fs.writeFileSync('test2.js', content(object), "utf8");
  console.log(object)
  rl.close();
});


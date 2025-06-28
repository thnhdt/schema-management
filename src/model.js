const { Sequelize } = require("sequelize")
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

connection()
export const getAllUsers = async (arg) => {
  const results = await sequelize.query(`
            BEGIN;
        SELECT get_all_users_by_email_into_cursor(?);
        FETCH ALL  from  mycursor;
        COMMIT;`, {
    replacements: [arg],
    raw: true // Use replacements to safely pass parameters
  })
  close()
  results[0].shift()
  console.log(results[0])
  return results[0]
}
export const getAllUsers1 = async (arg, arg1) => {
  const results = await sequelize.query(`
            BEGIN;
        SELECT get_all_users_by_email_into_cursor_1(?,?);
        FETCH ALL  from  mycursor;
        COMMIT;`, {
    replacements: [arg, arg1],
    raw: true // Use replacements to safely pass parameters
  })
  close()
  results[0].shift()
  console.log(results[0])
  return results[0]
}

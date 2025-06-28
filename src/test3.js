module.exports = {
  "getAllUsers": {
    "arguments": [
      {
        "name": "arg",
        "type": "DataTypes.STRING"
      }
    ],
    "return_type": "refcursor",
    "call_function": "get_all_users_by_email_into_cursor(?)"
  },
  "getAllUsers1": {
    "arguments": [
      {
        "name": "arg",
        "type": "DataTypes.STRING"
      },
      {
        "name": "arg1",
        "type": "DataTypes.INTEGER"
      }
    ],
    "return_type": "refcursor",
    "call_function": "get_all_users_by_email_into_cursor_1(?,?)"
  }
}
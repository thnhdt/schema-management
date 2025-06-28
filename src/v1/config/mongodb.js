const mongoose = require("mongoose");
const env = require('./environment');
class Database {
  constructor() {
    this.connect()
  }
  connect(type = "mongodb") {
    mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 50
    }).then(console.log("Connected Database successfully !"))
      .catch(err => console.log("Error connect !"))

  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database
    }

    return Database.instance
  }
}
module.exports = Database.getInstance()

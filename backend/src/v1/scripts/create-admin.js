const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Role = require("../models/role.model");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/yourDB");
  let adminRole = await Role.findOne({ name: "admin" });
  if (!adminRole) {
    adminRole = await Role.create({
      name: "admin",
      permissions: ["*"],
      isCreate: true
    });
    console.log("Quyền admin đã được tạo với ID:", adminRole._id);
  } else {
    console.log("Quyền admin đã tồn tại với ID:", adminRole._id);
  }

  const existingAdmin = await User.findOne({ "roles": adminRole._id });
  if (existingAdmin) {
    console.log("Tài khoản admin đã tồn tại. Không tạo thêm.");
    process.exit(0);
  }

  const password = await bcrypt.hash("123456", 10);

  await User.create({
    name: "admin",
    email: "admin@example.com",
    password,
    roles: [adminRole._id]
  });

  console.log("Tài khoản admin mặc định đã được tạo với role:", adminRole._id);
  process.exit(0);
}

run().catch(err => {
  console.error("Lỗi khi tạo admin:", err);
  process.exit(1);
});

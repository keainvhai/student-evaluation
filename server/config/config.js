require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
require("mysql2"); // ✅ 强制加载驱动，解决 "Please install mysql2" 错误

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS, // ⚠️ 确保 .env 中定义了 DB_PASS
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Aiven 云数据库常用
      },
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

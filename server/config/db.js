require("dotenv").config();

const mysql = require("mysql2");

const sqlConnectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

console.log("MySQL pool created:", typeof sqlConnectionPool.query);

sqlConnectionPool.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");

  connection.release();
});

module.exports = sqlConnectionPool;

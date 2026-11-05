require("dotenv").config();

const mysql = require("mysql2");

const sqlConnectionPool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "arya@07",
    database: "sharespace",
    connectionLimit: 10
});

console.log("MySQL pool created:", typeof sqlConnectionPool.query);

module.exports = sqlConnectionPool;
// dbConfig.js

const mysql = require("mysql");
//Live DB Credentials
const HOST = "192.46.212.254";
const USER = "inno";
const PASSWORD = "Inno@2024";

// const HOST = "localhost";
// const USER = "root";
// const PASSWORD = "";

const createPool = (database) => {
  return mysql.createPool({
    connectionLimit: 5,
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: database,
    idleTimeoutMillis: 5000, // 5 seconds
  });
};

module.exports = {
  createPool,
};

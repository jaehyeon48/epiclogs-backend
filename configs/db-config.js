const mysql = require('mysql2');
require('dotenv').config();

const db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100
};


const pool = mysql.createPool(db_config);

module.exports = pool.promise();
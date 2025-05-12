const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_ID,
    waitForConnections: true,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL 연결 실패 : ', err);
    } else {
        console.log('MySQL 연결 성공!');
        connection.release();
    }
});

module.exports = pool.promise();
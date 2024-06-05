const mysql = require('mysql2');
const dotenv = require('dotenv').config();

const pool = mysql.createPool({
  host: "localhost",
  user: "ayushka",
  password: process.env.PASSWD,
  database: process.env.DATABASE,
  insecureAuth: true
}).promise();

// pool.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// })

//   pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to database:', err);
//         return;
//     }
//     console.log('Database connected!');
//     connection.release(); // Release the connection
// });

  async function createUser(name) {
    const result = await pool.query(`insert into users(name) values(?)`, [name]);
    const id = result[0].insertId;
    return getUser(id);
  }

  async function getUser(id) {
    const res = await pool.query(
      `
      SELECT * FROM users
      where id = ?`,
      [id]
    );
  
    return res[0];
  }

  async function getUserByName(username) {
    const query = `select * from users where username = ?`;
    const result = pool.query(query, [username]);
    return result;
  }

  async function getUsers() {
    const [result] = await pool.query("SELECT * from users");
  
    return result;
  }

  async function updateUserName(userId, newName) {
    const sql = "UPDATE users SET name = ? WHERE id = ?";
    const [result] = await pool.query(sql, [newName, userId]);
    return getUser(userId);
  }
  
  async function deleteUser(userId, newName) {
    const sql = "DELETE from users WHERE id = ?";
    const [result] = await pool.query(sql, [userId]);
    return result;
  }

  module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUserName,
    deleteUser,
    pool,
    getUserByName,
  };
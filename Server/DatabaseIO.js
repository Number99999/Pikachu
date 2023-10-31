const mysql = require("mysql2");

class DataBaseIO {
  connection = null;
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "connect_animal",
    });
  }

  createTable = function () {
    let query =
      "CREATE TABLE IF NOT EXISTS users(id int primary key AUTO_INCREMENT, username VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL)";
    try {
      this.connection.query(query, (err, res) => {
        if (err) {
          console.error("Lỗi khi tạo bảng: ", err);
        } else console.log("Bảng đã được tạo thành công!");
      });
    } catch (error) {
      console.error("Lỗi khi tạo bảng: ", err);
    }
  };

  addUser = function (data) {
    let query = "insert into users set?";
    return new Promise((resolve, reject) => {
      this.connection.query(query, data, (err, res) => {
        if (err) {
          console.error("Lỗi khi chèn dữ liệu: ", err);
          reject(err);
        } else {
          console.log("Dữ liệu đã được chèn thành công!");
          resolve(res);
        }
      });
    });
  }

  getUserLogin = function (username, password) {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    return new Promise((resolve, reject) => {
      this.connection.query(query, [username, password], (error, results) => {
        if (error) {
          reject(error)
        } else {
          resolve(results[0])
        }
      });
    })
  }

  getUserByUsername = function (username) {
    const query = "select * from users where username =?";
    return new Promise((res, rej) => {
      this.connection.query(query, [username], (err, results) => {
        if (err)
          rej(err)
        else res(results[0]);
      })
    })
  }
}

module.exports = DataBaseIO;

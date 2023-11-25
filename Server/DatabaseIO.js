const mysql = require("mysql8");

class DataBaseIO {
  connection = null;
  constructor() {
    this.connection = mysql.createConnection({
      user: "root",
      password: "password",
      database: "connect_animal",
    });
    console.log(this.connection == null);
  }

  createTable() {
    this.createTableUser();
    this.createTableLevel();
  };

  async createTableLevel() {
    let query = "create table if not exists level(id int auto_increment primary key,score int)";
    try {
      await new Promise((resolve, reject) => {
        this.connection.query(query, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
      console.log("Bảng level đã được tạo thành công!");
    } catch (err) {
      console.error("Lỗi khi tạo bảng: ", err);
    }
  }

  async createTableUser() {
    let query = "CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT PRIMARY KEY, " +
      "username VARCHAR(255) NOT NULL, " +
      "password VARCHAR(255) NOT NULL, " +
      "level INT DEFAULT 1, " +
      "hint INT DEFAULT 5, " +
      "refresh INT DEFAULT 5)";
    try {
      await new Promise((resolve, reject) => {
        this.connection.query(query, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
      console.log("Bảng user đã được tạo thành công!");
    } catch (err) {
      console.error("Lỗi khi tạo bảng: ", err);
    }
  }

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

  addLevel = function (data) {
    let query = "insert into level(id, score) values(" + data.id + ", " + data.score + ");";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        if (err) {
          console.error("Thêm level failed: ", err);
          reject(err)
        }
        else {
          console.log("add level successed");
          resolve(res)
        }
      })
    })
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

  async getInfoLevel(level) {
    const query = 'SELECT * FROM level WHERE id = ?';
    try {
      return await new Promise((resolve, reject) => {
        this.connection.query(query, [level], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }


  async saveInfo(id, hint, refresh, level) {
    const query = "update users set level = " + level + ",hint =" + hint + ", refresh = " + refresh + " where id=" + id
    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, results) => {
        if (error) {
          reject(error)
          console.log("Lỗi lưu info user:", error)
        } else {
          resolve(results)
          console.log("luu info user thanh cong");
        }
      });
    })
  }

  async saveLevel(level, score) {
    const query = "update level set score = " + score + " where id= " + level;
    return await new Promise((resolve, reject) => {
      this.connection.query(query, (error, results) => {
        if (error) {
          reject(error);
          console.log("Lỗi lưu info level: ", error)
        }
        else {
          resolve(results);
          console.log("Lưu info level thành công");
        }
      })
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

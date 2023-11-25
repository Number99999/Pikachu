const mysql = require('mysql2');

// Tạo một kết nối với cơ sở dữ liệu MySQL
const connection = mysql.createConnection({
    host: 'localhost',       // Địa chỉ máy chủ MySQL (hoặc IP)
    user: 'connect_animal',   // Tên người dùng MySQL
    password: 'your_password'// Mật khẩu người dùng MySQL
});

// Kết nối đến máy chủ MySQL
connection.connect((error) => {
    if (error) {
        console.error('Lỗi kết nối:', error);
        return;
    }

    console.log('Đã kết nối thành công đến máy chủ MySQL');

    // Tạo cơ sở dữ liệu
    connection.query('CREATE DATABASE IF NOT EXISTS mydatabase', (error, results) => {
        if (error) {
            console.error('Lỗi tạo cơ sở dữ liệu:', error);
            return;
        }
        console.log('Cơ sở dữ liệu đã được tạo hoặc đã tồn tại');

        // Chọn cơ sở dữ liệu
        connection.query('USE mydatabase', (error, results) => {
            if (error) {
                console.error('Lỗi chọn cơ sở dữ liệu:', error);
                return;
            }
            console.log('Cơ sở dữ liệu đã được chọn');

            // Tạo bảng
            const createTableQuery = `
        CREATE TABLE IF NOT EXISTS mytable (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          age INT
        )`;

            connection.query(createTableQuery, (error, results) => {
                if (error) {
                    console.error('Lỗi tạo bảng:', error);
                    return;
                }
                console.log('Bảng đã được tạo hoặc đã tồn tại');

                // Đóng kết nối
                connection.end((error) => {
                    if (error) {
                        console.error('Lỗi đóng kết nối:', error);
                        return;
                    }
                    console.log('Kết nối đã đóng');
                });
            });
        });
    });
});
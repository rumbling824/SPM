// backend/create-test-user.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database', 'library.db');
const db = new sqlite3.Database(dbPath);

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // 检查用户是否已存在
    db.get('SELECT student_id FROM users WHERE student_id = ?', ['2021001'], (err, row) => {
      if (err) {
        console.error('查询失败:', err);
        return;
      }
      
      if (row) {
        console.log('测试账号已存在');
        // 更新密码
        db.run(
          'UPDATE users SET password = ? WHERE student_id = ?',
          [hashedPassword, '2021001'],
          (err) => {
            if (err) {
              console.error('更新密码失败:', err);
            } else {
              console.log('测试账号密码已更新为: password123');
            }
            db.close();
          }
        );
      } else {
        // 创建新账号
        db.run(
          `INSERT INTO users (student_id, name, id_card, password, email, role, max_borrow_limit) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['2021001', '张三', '110101200001011234', hashedPassword, 'test@example.com', 'reader', 5],
          function(err) {
            if (err) {
              console.error('创建测试账号失败:', err);
            } else {
              console.log('测试账号创建成功！');
              console.log('学号: 2021001');
              console.log('密码: password123');
            }
            db.close();
          }
        );
      }
    });
  } catch (error) {
    console.error('错误:', error);
  }
}

createTestUser();
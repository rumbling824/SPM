import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendVerificationCode } from './config/email.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
const dbPath = join(__dirname, 'database', 'library.db');
const db = new sqlite3.Database(dbPath);

// 生成6位随机验证码
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ========== 用户认证相关接口 ==========

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    const { student_id, name, id_card, password, email } = req.body;

    // 验证密码格式
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: '密码必须为6-16位，包含字母和数字' });
    }

    try {
        // 检查学号是否已存在
        db.get('SELECT student_id FROM users WHERE student_id = ?', [student_id], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: '数据库查询失败' });
            }
            if (row) {
                return res.status(400).json({ error: '学号已存在' });
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);

            // 插入新用户
            db.run(
                'INSERT INTO users (student_id, name, id_card, password, email, role) VALUES (?, ?, ?, ?, ?, ?)',
                [student_id, name, id_card, hashedPassword, email, 'reader'],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: '注册失败' });
                    }
                    res.json({ message: '注册成功', student_id });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登录
// app.post('/api/auth/login', (req, res) => {
//     const { student_id, password, remember } = req.body;

//     db.get('SELECT * FROM users WHERE student_id = ?', [student_id], async (err, user) => {
//         if (err) {
//             return res.status(500).json({ error: '数据库查询失败' });
//         }
//         if (!user) {
//             return res.status(401).json({ error: '学号不存在' });
//         }

//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             return res.status(401).json({ error: '密码错误' });
//         }

//         // 生成JWT令牌
//         const token = jwt.sign(
//             { student_id: user.student_id, name: user.name, role: user.role },
//             JWT_SECRET,
//             { expiresIn: remember ? '7d' : '24h' }
//         );

//         res.json({
//             message: '登录成功',
//             token,
//             user: {
//                 student_id: user.student_id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     });
// });

app.post('/api/auth/login', (req, res) => {
  const { student_id, password, remember } = req.body;
  
  console.log('登录请求:', { student_id, remember });

  db.get('SELECT * FROM users WHERE student_id = ?', [student_id], async (err, user) => {
    if (err) {
      console.error('数据库查询失败:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }
    
    if (!user) {
      console.log('学号不存在:', student_id);
      return res.status(401).json({ error: '学号不存在' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        console.log('密码错误');
        return res.status(401).json({ error: '密码错误' });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { 
          student_id: user.student_id, 
          name: user.name, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: remember ? '7d' : '24h' }
      );

      console.log('登录成功:', user.student_id);

      res.json({
        message: '登录成功',
        token,
        user: {
          student_id: user.student_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('密码验证失败:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  });
});

// 发送验证码（密码重置）
app.post('/api/auth/send-reset-code', (req, res) => {
    const { student_id, email } = req.body;

    db.get('SELECT * FROM users WHERE student_id = ? AND email = ?', [student_id, email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询失败' });
        }
        if (!user) {
            return res.status(400).json({ error: '学号与邮箱不匹配' });
        }

        // 生成验证码
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

        // 保存验证码
        db.run(
            'INSERT INTO verification_codes (email, student_id, code, expires_at) VALUES (?, ?, ?, ?)',
            [email, student_id, code, expiresAt],
            async function(err) {
                if (err) {
                    return res.status(500).json({ error: '验证码生成失败' });
                }

                // 发送邮件
                const result = await sendVerificationCode(email, code);
                if (result.success) {
                    res.json({ message: '验证码已发送至您的邮箱' });
                } else {
                    res.status(500).json({ error: '邮件发送失败，请稍后重试' });
                }
            }
        );
    });
});

// 验证验证码并重置密码
app.post('/api/auth/reset-password', (req, res) => {
    const { student_id, code, new_password } = req.body;

    // 验证密码格式
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (!passwordRegex.test(new_password)) {
        return res.status(400).json({ error: '密码必须为6-16位，包含字母和数字' });
    }

    db.get(
        'SELECT * FROM verification_codes WHERE student_id = ? AND code = ? AND used = 0 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
        [student_id, code],
        async (err, record) => {
            if (err) {
                return res.status(500).json({ error: '数据库查询失败' });
            }
            if (!record) {
                return res.status(400).json({ error: '验证码无效或已过期' });
            }

            // 标记验证码为已使用
            db.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [record.id]);

            // 更新密码
            const hashedPassword = await bcrypt.hash(new_password, 10);
            db.run(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?',
                [hashedPassword, student_id],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: '密码重置失败' });
                    }
                    res.json({ message: '密码重置成功' });
                }
            );
        }
    );
});

// ========== 用户信息相关接口 ==========

// 获取当前用户信息
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const { student_id } = req.user;

    db.get(
        `SELECT u.student_id, u.name, u.email, u.max_borrow_limit, u.current_borrowed,
        (SELECT config_value FROM system_config WHERE config_key = 'borrow_days') as borrow_days
        FROM users u WHERE u.student_id = ?`,
        [student_id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: '数据库查询失败' });
            }
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            res.json({
                student_id: user.student_id,
                name: user.name,
                email: user.email,
                current_borrowed: user.current_borrowed,
                max_borrow_limit: user.max_borrow_limit,
                available_borrow_count: user.max_borrow_limit - user.current_borrowed
            });
        }
    );
});

// ========== 图书检索相关接口 ==========

// 搜索图书
app.get('/api/books/search', authenticateToken, (req, res) => {
    const { keyword, type = 'title', page = 1, limit = 10, available_only = 'false' } = req.query;

    let query = `
        SELECT title, author, isbn, total_copies, available_copies, location, status,
        CASE 
            WHEN status = 'damaged' THEN '不可借（损坏）'
            WHEN status = 'lost' THEN '不可借（丢失）'
            WHEN available_copies = 0 THEN '不可借（已借出）'
            ELSE '可借'
        END as status_text
        FROM books WHERE 1=1
    `;
    const params = [];

    if (keyword) {
        if (type === 'title') {
            query += ` AND title LIKE ?`;
            params.push(`%${keyword}%`);
        } else if (type === 'author') {
            query += ` AND author LIKE ?`;
            params.push(`%${keyword}%`);
        } else if (type === 'isbn') {
            query += ` AND isbn LIKE ?`;
            params.push(`%${keyword}%`);
        }
    }

    if (available_only === 'true') {
        query += ` AND available_copies > 0 AND status = 'available'`;
    }

    // 获取总数
    db.get(`SELECT COUNT(*) as total FROM (${query})`, params, (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: '查询失败' });
        }

        const total = countResult.total;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        db.all(query, params, (err, books) => {
            if (err) {
                return res.status(500).json({ error: '查询失败' });
            }

            res.json({
                books,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / parseInt(limit)),
                    total_items: total,
                    items_per_page: parseInt(limit)
                }
            });
        });
    });
});

// ========== 借阅相关接口 ==========

// 借阅图书
app.post('/api/borrow', authenticateToken, (req, res) => {
    const { isbn } = req.body;
    const { student_id } = req.user;

    // 检查用户信息
    db.get(
        'SELECT current_borrowed, max_borrow_limit FROM users WHERE student_id = ?',
        [student_id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: '数据库查询失败' });
            }
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            if (user.current_borrowed >= user.max_borrow_limit) {
                return res.status(400).json({ error: '已达到最大借阅数量' });
            }

            // 检查图书信息
            db.get(
                'SELECT * FROM books WHERE isbn = ?',
                [isbn],
                (err, book) => {
                    if (err) {
                        return res.status(500).json({ error: '数据库查询失败' });
                    }
                    if (!book) {
                        return res.status(404).json({ error: '图书不存在' });
                    }
                    if (book.available_copies <= 0 || book.status !== 'available') {
                        return res.status(400).json({ error: '图书不可借' });
                    }

                    // 获取借阅天数配置
                    db.get(
                        'SELECT config_value FROM system_config WHERE config_key = "borrow_days"',
                        [],
                        (err, config) => {
                            if (err) {
                                return res.status(500).json({ error: '获取配置失败' });
                            }

                            const borrowDays = parseInt(config.config_value) || 30;
                            const dueDate = new Date(Date.now() + borrowDays * 24 * 60 * 60 * 1000);

                            // 开始事务
                            db.run('BEGIN TRANSACTION');

                            // 更新图书可借数量
                            db.run(
                                'UPDATE books SET available_copies = available_copies - 1 WHERE isbn = ? AND available_copies > 0',
                                [isbn],
                                function(err) {
                                    if (err || this.changes === 0) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ error: '更新图书信息失败' });
                                    }

                                    // 更新用户借阅数量
                                    db.run(
                                        'UPDATE users SET current_borrowed = current_borrowed + 1 WHERE student_id = ?',
                                        [student_id],
                                        function(err) {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                return res.status(500).json({ error: '更新用户信息失败' });
                                            }

                                            // 创建借阅记录
                                            db.run(
                                                `INSERT INTO borrow_records (student_id, book_isbn, borrow_date, due_date, status) 
                                                VALUES (?, ?, datetime('now'), ?, 'borrowed')`,
                                                [student_id, isbn, dueDate.toISOString()],
                                                function(err) {
                                                    if (err) {
                                                        db.run('ROLLBACK');
                                                        return res.status(500).json({ error: '创建借阅记录失败' });
                                                    }

                                                    db.run('COMMIT');
                                                    res.json({ 
                                                        message: '借阅成功',
                                                        due_date: dueDate
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// 获取当前用户的借阅记录
app.get('/api/borrow/my-records', authenticateToken, (req, res) => {
    const { student_id } = req.user;

    db.all(
        `SELECT br.*, b.title, b.author,
        CASE 
            WHEN br.status = 'borrowed' AND datetime(br.due_date) < datetime('now') THEN '逾期'
            WHEN br.status = 'borrowed' THEN '借阅中'
            ELSE br.status
        END as status_text
        FROM borrow_records br
        JOIN books b ON br.book_isbn = b.isbn
        WHERE br.student_id = ? AND br.status = 'borrowed'
        ORDER BY br.borrow_date DESC`,
        [student_id],
        (err, records) => {
            if (err) {
                return res.status(500).json({ error: '查询失败' });
            }
            res.json(records);
        }
    );
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`后端服务器运行在 http://localhost:${PORT}`);
});
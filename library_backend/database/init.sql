-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    id_card TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'reader',
    max_borrow_limit INTEGER DEFAULT 5,
    current_borrowed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建图书表
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location TEXT,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建借阅记录表
CREATE TABLE IF NOT EXISTS borrow_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    book_isbn TEXT NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    return_date DATETIME,
    status TEXT DEFAULT 'borrowed',
    FOREIGN KEY (student_id) REFERENCES users(student_id),
    FOREIGN KEY (book_isbn) REFERENCES books(isbn)
);

-- 创建验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT
);

-- 插入默认配置
INSERT OR IGNORE INTO system_config (config_key, config_value, description) 
VALUES ('borrow_days', '30', '默认借阅天数');

-- 插入测试数据
INSERT OR IGNORE INTO users (student_id, name, id_card, password, email, role, max_borrow_limit) 
VALUES ('2021001', '张三', '110101200001011234', '$2a$10$YKxoWYpXGqPH3QqXQvq1Xe7YpY5QqXQvq1Xe7YpY5QqXQvq1Xe7Y', 'zhangsan@example.com', 'reader', 5);

INSERT OR IGNORE INTO books (title, author, isbn, total_copies, available_copies, location, status) VALUES
('高等数学', '同济大学数学系', '9787040396638', 5, 5, 'A区-2F-01', 'available'),
('线性代数', '同济大学数学系', '9787040396614', 3, 3, 'A区-2F-02', 'available'),
('C程序设计', '谭浩强', '9787302224462', 4, 4, 'B区-3F-05', 'available'),
('数据结构', '严蔚敏', '9787302330646', 2, 0, 'B区-3F-06', 'damaged'),
('计算机网络', '谢希仁', '9787121302954', 3, 3, 'B区-3F-08', 'available');
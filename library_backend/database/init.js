import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'library.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

// 读取并执行SQL文件
const initSQL = fs.readFileSync(join(__dirname, 'init.sql'), 'utf8');

db.exec(initSQL, (err) => {
    if (err) {
        console.error('数据库初始化失败:', err);
    } else {
        console.log('数据库初始化成功！');
        console.log('数据库路径:', dbPath);
    }
    db.close();
});
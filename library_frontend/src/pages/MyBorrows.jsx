import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

const MyBorrows = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '图书名',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'ISBN',
      dataIndex: 'book_isbn',
      key: 'book_isbn',
      width: 150,
    },
    {
      title: '借阅时间',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '应归还时间',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status_text',
      key: 'status_text',
      width: 120,
      render: (text) => {
        if (text === '逾期') {
          return <Tag color="red">{text}</Tag>;
        } else if (text === '借阅中') {
          return <Tag color="blue">{text}</Tag>;
        }
        return <Tag>{text}</Tag>;
      },
    },
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/borrow/my-records');
      setRecords(response.data);
    } catch (error) {
      message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>我的借阅</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchRecords}>
          刷新
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: '暂无借阅记录',
          }}
        />
      </Card>
    </div>
  );
};

export default MyBorrows;
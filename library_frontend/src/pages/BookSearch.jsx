import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Switch,
  message,
  Pagination,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Search } = Input;
const { Option } = Select;

const BookSearch = () => {
  const [searchType, setSearchType] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns = [
    {
      title: '图书名',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 150,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 150,
    },
    {
      title: '馆藏总数',
      dataIndex: 'total_copies',
      key: 'total_copies',
      width: 100,
    },
    {
      title: '可借数量',
      dataIndex: 'available_copies',
      key: 'available_copies',
      width: 100,
      render: (count, record) => {
        if (record.status !== 'available' || count === 0) {
          return <Tag color="red">0</Tag>;
        }
        return <Tag color="green">{count}</Tag>;
      },
    },
    {
      title: '馆藏位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status_text',
      key: 'status_text',
      width: 150,
      render: (text, record) => {
        if (record.status !== 'available' || record.available_copies === 0) {
          return <Tag color="red">{text}</Tag>;
        }
        return <Tag color="green">{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          disabled={record.available_copies === 0 || record.status !== 'available'}
          onClick={() => handleBorrow(record)}
        >
          借阅
        </Button>
      ),
    },
  ];

  const handleSearch = async (page = 1) => {
    if (!keyword) {
      message.warning('请输入检索关键词');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/books/search', {
        params: {
          keyword,
          type: searchType,
          page,
          limit: pagination.pageSize,
          available_only: availableOnly,
        },
      });

      setBooks(response.data.books);
      setPagination({
        ...pagination,
        current: response.data.pagination.current_page,
        total: response.data.pagination.total_items,
      });
    } catch (error) {
      message.error('检索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (book) => {
    try {
      await api.post('/borrow', { isbn: book.isbn });
      message.success('借阅成功！');
      handleSearch(pagination.current);
    } catch (error) {
      message.error(error.response?.data?.error || '借阅失败');
    }
  };

  const handlePageChange = (page) => {
    handleSearch(page);
  };

  useEffect(() => {
    // 初始不自动搜索
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>图书检索</h1>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Select
            value={searchType}
            onChange={setSearchType}
            style={{ width: 120 }}
          >
            <Option value="title">图书名</Option>
            <Option value="author">作者</Option>
            <Option value="isbn">ISBN</Option>
          </Select>

          <Search
            placeholder="请输入检索关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => handleSearch(1)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />

          <Space>
            <Switch
              checked={availableOnly}
              onChange={setAvailableOnly}
            />
            <span>仅看可借</span>
          </Space>

          <Button type="primary" onClick={() => handleSearch(1)}>
            检索
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={books}
          loading={loading}
          rowKey="isbn"
          pagination={false}
          scroll={{ x: 1200 }}
        />

        {books.length > 0 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 条记录`}
            />
          </div>
        )}

        {!loading && books.length === 0 && keyword && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无相关图书
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookSearch;
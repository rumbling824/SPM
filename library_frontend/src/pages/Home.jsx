import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Button } from 'antd';
import { BookOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/user/profile');
      setUserInfo(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>欢迎使用图书馆管理系统</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前可借图书数量"
              value={userInfo.available_borrow_count || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已借未归还数量"
              value={userInfo.current_borrowed || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="最大可借数量"
              value={userInfo.max_borrow_limit || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="快速操作"
            extra={
              <Button type="link" onClick={() => navigate('/search')}>
                更多图书
              </Button>
            }
          >
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={[
                {
                  title: '图书检索',
                  description: '搜索您想要的图书',
                  action: () => navigate('/search'),
                },
                {
                  title: '我的借阅',
                  description: '查看当前借阅记录',
                  action: () => navigate('/my-borrows'),
                },
                {
                  title: '个人中心',
                  description: '查看个人信息',
                  action: () => navigate('/profile'),
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Card hoverable onClick={item.action}>
                    <Card.Meta
                      title={item.title}
                      description={item.description}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
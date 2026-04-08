import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import api from '../utils/api';

const PersonalCenter = () => {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      setUserInfo(response.data);
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>个人中心</h1>

      <Card
        title="基本信息"
        extra={
          <Button icon={<EditOutlined />} disabled>
            编辑（功能开发中）
          </Button>
        }
        loading={loading}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="学号">{userInfo.student_id}</Descriptions.Item>
          <Descriptions.Item label="姓名">{userInfo.name}</Descriptions.Item>
          <Descriptions.Item label="绑定邮箱">{userInfo.email}</Descriptions.Item>
          <Descriptions.Item label="当前可借图书数量">
            <span style={{ color: '#3f8600', fontSize: 18, fontWeight: 'bold' }}>
              {userInfo.available_borrow_count || 0}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="已借未归还数量">
            <span style={{ color: '#cf1322', fontSize: 18, fontWeight: 'bold' }}>
              {userInfo.current_borrowed || 0}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="最大可借数量">
            {userInfo.max_borrow_limit || 0}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default PersonalCenter;
// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 清除旧的登录状态
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('尝试登录:', values);
      
      const response = await api.post('/auth/login', {
        student_id: values.student_id,
        password: values.password,
        remember: values.remember || false
      });
      
      const { token, user } = response.data;
      
      console.log('登录成功，保存token');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      message.success('登录成功！');
      
      // 延迟跳转，确保状态已保存
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('登录失败:', error);
      
      // 根据不同的错误类型显示不同的提示
      if (error.response?.status === 401) {
        message.error(error.response?.data?.error || '学号或密码错误');
      } else if (error.response?.status === 500) {
        message.error('服务器错误，请稍后重试');
      } else {
        message.error('网络错误，请检查连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="读者登录">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="student_id"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="学号" 
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住密码</Checkbox>
            </Form.Item>
            <Link to="/forgot-password" style={{ float: 'right' }}>
              忘记密码？
            </Link>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
            >
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            还没有账号？ <Link to="/register">立即注册</Link>
          </div>
          
          {/* 添加测试账号提示 */}
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            background: '#f0f2f5', 
            borderRadius: 4,
            fontSize: 12,
            color: '#666'
          }}>
            <div>测试账号：</div>
            <div>学号：2021001</div>
            <div>密码：password123</div>
            <div style={{ marginTop: 8, color: '#999' }}>
              注意：需要先在后端数据库中创建此账号
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
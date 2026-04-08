import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Steps } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Step } = Steps;

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/send-reset-code', values);
      setStudentId(values.student_id);
      setEmail(values.email);
      message.success('验证码已发送至您的邮箱');
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.error || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        student_id: studentId,
        code: values.code,
        new_password: values.new_password,
      });
      message.success('密码重置成功！请使用新密码登录');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.error || '密码重置失败');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (!value) {
      return Promise.reject('请输入新密码');
    }
    if (!passwordRegex.test(value)) {
      return Promise.reject('密码必须为6-16位，包含字母和数字');
    }
    return Promise.resolve();
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="找回密码">
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="验证身份" />
          <Step title="重置密码" />
        </Steps>

        {currentStep === 0 && (
          <Form onFinish={handleSendCode} size="large">
            <Form.Item
              name="student_id"
              rules={[{ required: true, message: '请输入学号' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="学号" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="绑定邮箱" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                发送验证码
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login">返回登录</Link>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <Form onFinish={handleResetPassword} size="large">
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input prefix={<SafetyOutlined />} placeholder="验证码" />
            </Form.Item>

            <Form.Item
              name="new_password"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['new_password']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                重置密码
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
import nodemailer from 'nodemailer';

// 创建邮件传输器（使用QQ邮箱示例）
const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: 'QQ邮箱', // 替换为你的QQ邮箱
        pass: '邮箱授权码' // 替换为你的授权码
    }
});

// 发送验证码邮件
export const sendVerificationCode = async (to, code) => {
    const mailOptions = {
        from: 'QQ邮箱', // 替换为你的QQ邮箱
        to: to,
        subject: '图书馆管理系统 - 密码重置验证码',
        html: `
            <h2>密码重置验证码</h2>
            <p>您的验证码是：<strong style="font-size: 24px; color: #1890ff;">${code}</strong></p>
            <p>验证码有效期为5分钟，请尽快使用。</p>
            <p>如果这不是您本人的操作，请忽略此邮件。</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('邮件发送失败:', error);
        return { success: false, error: error.message };
    }
};
const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

module.exports = {
  async sendMail({ to, subject, text }) {
    return transporter.sendMail({
      from: env.mailFrom,
      to,
      subject,
      text,
    });
  },
};

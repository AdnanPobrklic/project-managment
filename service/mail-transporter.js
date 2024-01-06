const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    pool: true,
    maxConnections: 3, 
    tls: {
      ciphers:'SSLv3',
      rejectUnauthorized: false
    },
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PW,
    }
});

module.exports = transporter;
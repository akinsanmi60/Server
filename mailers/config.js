const nodemailer = require("nodemailer");
const Email = require("email-templates");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD, 
    },
  });

const email = new Email({
      views: { root: "email_templates",
      options: { extension: "ejs"},
    },
    message: {
      from: process.env.FROM
    },
    send: true,
    transport: transporter
});

module.exports = {    
  email,
};
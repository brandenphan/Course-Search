const nodemailer = require('nodemailer');
require('dotenv').config();

const handler = async (req, res) => {
  let html = '<p style="font-size: 2em;"><strong>Test Failures</strong></p>';

  for (let i = 0; i < req.body.data.length; i++) {
    html += `<p>`;
    html += `<strong><span style="color: #8B0000;">${i+1}. ${req.body.data[i].title}</span></strong><br />`;
    html += `${req.body.data[i].location.file}:${req.body.data[i].location.line}:${req.body.data[i].location.column}`;
    html += `</p>`;
  }

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: 'cis3760team8@gmail.com',
      pass: process.env.password,
    },
    secure: true,
  });

  const mailData = {
    from: 'cis3760team8@gmail.com',
    to: 'cis3760team8@gmail.com',
    subject: `Report: Failed Unit Tests for the CIS*3760 Team 8 Web App`,
    html,
  }

  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
    }
  });

  return res.status(200).json({});
};

export default handler;

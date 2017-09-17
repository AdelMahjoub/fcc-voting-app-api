const nodeMailer = require('nodemailer');
//const ejs = require('ejs');
const path = require('path');

class Mailer {
  
  static createTransport() {
    return new Promise((resolve, reject) => {
      if(process.env.NODE_ENV === 'production') {
        const transporter = nodeMailer.createTransport({
          host: process.env.APP_MAIL_HOSTNAME,
          port: process.env.APP_MAIL_PORT,
          secure: true,
          auth: {
            user: process.env.APP_MAIL_USER,
            pass: process.env.APP_MAIL_PASS
          }
        });
        resove(transporter);
      } else {
        // Generate test SMTP service account from ethereal.email
        // In development environement
        nodeMailer.createTestAccount((err, account) => {
          if(err) {
            reject(err);
          }
          const transporter = nodeMailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: account.user, // generated ethereal user
              pass: account.pass  // generated ethereal password
            }
          });
          resolve(transporter);
        });
      }
    });
  }

  sendConfirmToken(user, hostname) {
    return new Promise((resolve, reject) => {

      const url = `${hostname}/confirm`;
      const templatePath = path.join(__dirname, '../', 'views', 'mails', 'verification-mail.ejs');

      ejs.renderFile(templatePath , { confirmToken: user.confirmToken, link: url }, (err, data) => {
        if(err) {
          console.log(err);
          reject(err);
        }
        const options = {
          from: process.env.APP_MAIL_USER,
          to: [user.email, 'contact@adel-mahjoub.fr'],
          subject: `${require('../configs/common.config')['appName']} account verification`,
          html: data
        }
        this.transporter.sendMail(options, (err, info) => {
          if(err) {
            reject(err);
          }
          resolve(info);
        });
      });
    });
  }

  sendAccountActivation(user) {
    return new Promise((resolve, reject) => {
      
      const templatePath = path.join(__dirname, '../', 'views', 'mails', 'confirmation-mail.ejs');

      ejs.renderFile(templatePath, (err, data) => {
        if(err) {
          console.log(err);
          reject(err);
        }
        const options = {
          from: process.env.APP_MAIL_USER,
          to: user.email,
          subject: `${require('../configs/common.config')['appName']} account activated`,
          html: data
        }

        this.transporter.sendMail(options, (err, info) => {
          if(err) {
            reject(err);
          }
          resolve(info);
        });
      })
    });
  }

}

module.exports = Mailer;

Mailer.createTransport()
  .then(transporter => {
    console.log(transporter);
  })
  .catch(err => {
    console.log(err);
  });
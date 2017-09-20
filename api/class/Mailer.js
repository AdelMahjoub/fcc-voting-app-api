// ==============================================================
// nodemailer  https://nodemailer.com/about/
// ejs         https://github.com/mde/ejs
// path        https://nodejs.org/dist/latest-v6.x/docs/api/path.html
// ==============================================================
const nodeMailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

/**
 * 
 */
class Mailer {

  /**
   * Create transport on instanciation
   */
  constructor() {
    this.createTransport()
      .then(transporter => {
        this.transporter = transporter;
      })
      .catch(err => {
        throw err;
      })
  }
  
  /**
   * Crteate a transport or a test transport for development
   */
  createTransport() {
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
        resolve(transporter);
      } else {
        // Generate test SMTP service account from ethereal.email
        // In development environement
        nodeMailer.createTestAccount((err, account) => {
          if(err) {
            console.log(err);
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
          console.log(account);
          resolve(transporter);
        });
      }
    });
  }

  /**
   * Send a confirmToken by email to user.email
   * Using an ejs template to render content
   * @param {User} user 
   * @param {Request} req 
   */
  sendToken(user, req) {
    const sender = this.transporter.options.auth.user; 
    const url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : `localhost`;
    const templatePath = path.resolve('./templates/confirmTokenMail.ejs');
    return new Promise((resolve, reject) => {
      ejs.renderFile(templatePath, {
        title: process.env.APP_NAME,
        url, 
        confirmToken: user.confirmToken,
        username: user.username 
      }, (err, mail) => {
        if(err) {
          console.log(err);
          reject(err);
        }
        const options = {
          from: sender,
          to: user.email,
          subject: `${process.env.APP_NAME}`,
          html: mail
        }
        this.transporter.sendMail(options, (err, info) => {
          if(err) {
            console.log(err);
            reject(err);
          }
          resolve(info);
        });
      });
    });
  }

  sendAccountActivation(user, req) {
    const sender = this.transporter.options.auth.user; 
    const url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : `localhost`;
    const templatePath = path.resolve('./templates/accountActivationMail.ejs');
    return new Promise((resolve, reject) => {
      ejs.renderFile(templatePath, {
        title: process.env.APP_NAME,
        url, 
        username: user.username 
      }, (err, mail) => {
        if(err) {
          console.log(err);
          reject(err);
        }
        const options = {
          from: sender,
          to: user.email,
          subject: `${process.env.APP_NAME}`,
          html: mail
        }
        this.transporter.sendMail(options, (err, info) => {
          if(err) {
            console.log(err);
            reject(err);
          }
          resolve(info);
        });
      });
    });
  }
}

module.exports = new Mailer();
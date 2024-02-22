import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'

type EmailConfig = {
  email: string;
  subject: string;
  templatePath: string;
  templateData: object;
}

export class EmailManager {
  static createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  static async sendEmail(config: EmailConfig) {
    ejs.renderFile(path.join(__dirname, '..', '..', 'templates', config.templatePath), config.templateData, async (err, html) => {
      const transporter = EmailManager.createTransporter()

      return await transporter.sendMail({
        from: `"Andrew" <${process.env.EMAIL_USER}>`,
        to: config.email,
        subject: config.subject,
        html,
      })
    })
  }

  static async sendRegistrationConfirmationEmail(email: string, confirmationCode: string) {
    return await EmailManager.sendEmail({
      email,
      subject: 'Registration Confirmation',
      templatePath: 'emailConfirmation.ejs',
      templateData: { confirmationCode },
    });
  }

  static async sendPasswordRecoveryEmail(email: string, recoveryCode: string) {
    return await EmailManager.sendEmail({
      email,
      subject: 'Password Recovery',
      templatePath: 'passwordRecoveryEmail.ejs',
      templateData: { recoveryCode },
    });
  }
}

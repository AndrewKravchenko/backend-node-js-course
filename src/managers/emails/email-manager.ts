import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'

export class EmailManager {
  static async sendRegistrationConfirmationEmail(email: string, confirmationCode: string) {
    ejs.renderFile(path.join(__dirname, '..', '..', 'templates', 'emailConfirmation.ejs'), { confirmationCode }, async (err, html) => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      return await transporter.sendMail({
        from: `"Andrew" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Registration Confirmation',
        html,
      })
    })
  }
}

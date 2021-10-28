import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class MailService {
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // need true
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendActivationMail(to: string, link) {
    throw new Error("Not implemented");

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: 'Активация аккаунта на таком то сайте ' + process.env.API_URL,
      text: '',
      html: `
        <div>
          <h1>Для активации перейдите по ссылке</h1>
          <a href="${link}">${link}</a>
        </div>
      `
    });
  }
}

export = new MailService();

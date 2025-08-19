// utils/Mailer.js
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Setup handlebars templates
    this.transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          layoutsDir: path.resolve("./templates/email/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./templates/email/"),
        extName: ".hbs",
      })
    );
  }

  async sendMail({ to, subject, template, context }) {
    return this.transporter.sendMail({
      from: `"Online Voting System" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      template, // name of the .hbs file
      context, // data for template
    });
  }
}

export const mailer = new Mailer();

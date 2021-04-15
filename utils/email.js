const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

// const Vonage = require("@vonage/server-sdk");

// const vonage = new Vonage({
//   apiKey: "992a309b",
//   apiSecret: "vuiwHJsFRgvE27Q8",
// });

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Natours admin <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.SIB_HOST,
        port: process.env.SIB_PORT,
        auth: {
          user: process.env.SIB_USER,
          pass: process.env.SIB_PASS,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);

    // const from = "Vonage APIs";
    // const to = "919444881651";
    // const text = "This is just a test";

    // vonage.message.sendSms(from, to, text, (err, responseData) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     if (responseData.messages[0]["status"] === "0") {
    //       console.log("Message sent successfully.");
    //     } else {
    //       console.log(
    //         `Message failed with error: ${responseData.messages[0]["error-text"]}`
    //       );
    //     }
    //   }
    // });
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Natours!");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Resetting user password - reg");
  }
};

// const sendEmail = async options => {
// need to activate less secure access
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: "hariprasathh240601@gmail.com",
//     pass: "Hari@2001",
//   },
// });

//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: "natours",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

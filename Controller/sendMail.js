// const User = require("../Models/userSchema");
// const sgMail = require("@sendgrid/mail");
// const logger = require("winston");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// async function sendEmailWithAttachment(email, subject, html) {
//   try {
//     const fs = require("fs");
//     const path = require("path");
//     const filePath = path.join(__dirname, "agreement.pdf");
//     const file = fs.readFileSync(filePath);
//     const pdf = file.toString("base64");
//     const attachment = {
//       filename: "agreement.pdf",
//       content: pdf,
//       contentType: "application/pdf",
//       disposition: "attachment",
//     };
//     const mailOptions = {
//       to: email,
//       from: process.env.EMAIL_USERNAME,
//       subject: subject,
//       html: html, // Set the HTML content
//       attachments: [attachment],
//     };
//     await sgMail.send(mailOptions);
//     console.log("Mail sent successfully")
//     return true;
//   } catch (error) {
//     console.error("Error sending email", error);
//     return false;
//   }
// }

// async function updateUserMailStatus(userId) {
//   try {
//     await User.findOneAndUpdate(
//       { _id: userId },
//       { mailSend: true },
//       { new: true }
//     );
//     return true;
//   } catch (error) {
//     logger.error("Error updating user", error);
//     return false;
//   }
// }

// async function sendMail(emailData, userId) {
//   try {
//     const mailText = `Dear ${emailData.name}, <br> WELCOME TO CV FORCE SERVICE!!!<br><br><br> As per the discussion with our executive, you wish to join our platform of freelancing where you can make an extra earning by managing the resumes on our digital platform. <br><br><br> Weekly Entries - 500 <br> Payout(INR)- Minimum 5- Maximum 40/-(Depending upon the accuracy)<br> Project Duration - 6 Days <br><br><br> 90% accuracy is required for INR 90- Payout per Resume. Le 450 out of 500 must have to  typed accurately(without any mistake) In case If you will not complete the work within given time frame, then you have to pay 6,500/- (Portal Charges). As you know your first day is free and doesn't count in your project duration of 6 days, If you require more extension to compelete the project do let us know we we will provide you extension on reasonable charge. In order to start the work confirm your registration by digitally signing your e-aagreement as Under the provisions of the Information Technology Act, 2000 particularly Section 10-A, an electronic contract is valid and enforeable. The only essential requirement in  India is e digital sign as your registration process will be completed. <br><br><br> In order to start the work you must sign a contract in which all the terms and conditions are available regarding to the project. We hope our executive stated all the terms and cleared all your doubts. For your reference kindly go through the contract and sign it digitally through ID and Password credentials given below. <br><br><br> We wish you best of luck for the project, Thanks<br><br><br> Your ID: ${emailData.email} <br> Password: ${emailData.password} <br><br><br> You can login to your account by clicking this link below: <br> <a href="https://cvforceservice.com/login">Portal Link</a>`;

//     const emailOutput = await sendEmailWithAttachment(
//       emailData.email, // list of receivers
//       "Agreement", // Subject line
//       mailText // HTML content
//     );
//     if (emailOutput) {
//       await updateUserMailStatus(userId);
//       return { data: "Email sent successfully", value: true };
//     } else {
//       return { data: "Error sending email", value: false };
//     }
//   } catch (error) {
//     logger.error("Error sending email", error);
//     return { data: error.message, value: false };
//   }
// }

// module.exports = sendMail;


const path = require("path");
const fs = require("fs");
const User = require("../Models/userSchema");
// const sgMail = require("@sendgrid/mail");
// const logger = require("winston");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const nodemailer = require('nodemailer');

async function sendEmailWithAttachment(email, subject, html) {
  // create reusable transporter object using the default SMTP transport
    const filePath = path.join(__dirname, "agreement.pdf");
    const file = fs.readFileSync(filePath);
    const pdf = file.toString("base64");
    const attachment = {
      filename: "agreement.pdf",
      content: pdf,
      contentType: "application/pdf",
      disposition: "attachment",
    };
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // replace with your SMTP server host
    port: 465, // replace with your SMTP server port
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'Customer-care@cvforceservice.com', // replace with your SMTP server email
      pass: 'Tohid@123' // replace with your SMTP server email password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: 'Customer-care@cvforceservice.com', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: html, // plain text body
    attachments: [
        {
          filename: "agreement.pdf",
          content: pdf,
          path: filePath,
          contentType: "application/pdf",
          disposition: "attachment",
        }
    ]
  };

//   send mail with defined transport object
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}


async function updateUserMailStatus(userId) {
  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { mailSend: true },
      { new: true }
    );
    return true;
  } catch (error) {
    logger.error("Error updating user", error);
    return false;
  }
}

async function sendMail(emailData, userId) {
  try {
    const mailText = `Dear ${emailData.name},
WELCOME TO CV FORCE SERVICE!!!


As per the discussion with our executive, you wish to join our platform of freelancing where you can make an extra earning by managing the resumes on our digital platform.


Weekly Entries - 500
Payout(INR)- Minimum 5- Maximum 30/-(Depending upon the accuracy)
Project Duration - 6 Days


90% accuracy is required for INR 90- Payout per Resume. Le 450 out of 500 must have to  typed accurately(without any mistake) In case If you will not complete the work within given time frame, then you have to pay 6,500/- (Portal Charges). As you know your first day is free and doesn't count in your project duration of 6 days, If you require more extension to compelete the project do let us know we we will provide you extension on reasonable charge. In order to start the work confirm your registration by digitally signing your e-aagreement as Under the provisions of the Information Technology Act, 2000 particularly Section 10-A, an electronic contract is valid and enforeable. The only essential requirement in  India is e digital sign as your registration process will be completed.


In order to start the work you must sign a contract in which all the terms and conditions are available regarding to the project. We hope our executive stated all the terms and cleared all your doubts. For your reference kindly go through the contract and sign it digitally through ID and Password credentials given below.


We wish you best of luck for the project, Thanks


Your ID: ${emailData.email}
Password: ${emailData.password} 


You can login to your account by clicking this link : https://cvforceservice.com/login`;

    const emailOutput = await sendEmailWithAttachment(
      emailData.email, // list of receivers
      "Agreement", // Subject line
      mailText // HTML content
    );
    if (emailOutput) {
      await updateUserMailStatus(userId);
      return { data: "Email sent successfully", value: true };
    } else {
      return { data: "Error sending email", value: false };
    }
  } catch (error) {
    logger.error("Error sending email", error);
    return { data: error.message, value: false };
  }
}

module.exports = sendMail;
const Users = require("../Models/userSchema");
const SendMail = require("./sendMail");
const moment = require("moment");
// const bcrypt = require("bcrypt");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { encryptPassword } = require("./passwordEncryptDecrypt");

createUser = async (req, res) => {
  let user;
  try {
    let email = req.body.email;
    let { password, ...userData } = req.body;
    const existingUser = await Users.findOne({ email: email });

    if (existingUser)
      return res.status(409).send({ message: "User already exists" });

    const encryptPass = await encryptPassword(password);
    userData.password = encryptPass;

    user = new Users(userData);

    user.startDate = moment(user.createdAt).format("D MMMM YYYY");
    user.endDate = moment(user.createdAt).add(6, "days").format("D MMMM YYYY");

    await user.save();
    sendAgreement(user, req.body);

    res
      .status(201)
      .send({ message: "Created User successfully and sent email" });
  } catch (err) {
    if (user) {
      await user.remove();
    }
    res.status(500).send({ message: err.message });
  }
};

function savePDF(pdf) {
  return new Promise((resolve, reject) => {
    fs.writeFile(__dirname + "/agreement.pdf", pdf, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log("PDF file has been saved!");
        resolve();
      }
    });
  });
}

async function generatePDF(ejsFile) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const content = ejsFile;
  await page.setContent(content);
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();
  await savePDF(pdf);
  return pdf;
}

async function sendAgreement(user, body) {
  try {
    let ejsData = {};
    ejsData.path = __dirname + "/../views/agreement.ejs";
    ejsData.name = user.name;
    ejsData.address = user.address;
    ejsData.aadhar = user.aadharFront;
    ejsData.aadharBack = user.aadharBack;
    ejsData.sign = user.signOfUser;
    ejsData.date = user.startDate;

    let ejsFile = await ejs.renderFile(ejsData.path, {
      data: ejsData,
    });

    await generatePDF(ejsFile);

    // Call SendMail function asynchronously and handle any errors
    await SendMail(body, user._id);
    fs.unlinkSync(__dirname + "/agreement.pdf");
  } catch (err) {
    console.log("Error sending email", err);
    return { message: "Error sending email" };
  }
}

module.exports = createUser;

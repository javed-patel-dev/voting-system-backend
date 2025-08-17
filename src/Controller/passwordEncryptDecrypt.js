const crypto = require("crypto");
const iv = crypto.randomBytes(16);
require("dotenv").config();

async function encryptPassword(password) {
  const cipher = crypto.createCipheriv(
    process.env.ALGORITHM,
    process.env.ENCRYPTION_KEY,
    iv
  );
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${encrypted}.${iv.toString("hex")}`;
}

async function decryptPassword(encryptedPassword) {
  const [encrypted, ivHex] = encryptedPassword.split(".");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    process.env.ALGORITHM,
    process.env.ENCRYPTION_KEY,
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptPassword, decryptPassword };

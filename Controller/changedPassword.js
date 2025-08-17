const Users = require("../Models/userSchema");
// const bcrypt = require("bcrypt");
const { decryptPassword , encryptPassword} = require("./passwordEncryptDecrypt");

changedPassword = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  let newPassword = req.body.newPassword;
  // newPassword = await bcrypt.hash(newPassword, 10)
  // const isMatch = await bcrypt.compare(currentPassword, user.password);
  let userPass = await decryptPassword(req.user.password);
  
  if (currentPassword !== userPass)
    return res.status(403).send({ message: "Invalid current password" });
  
  let encryptCurrentPassword = await encryptPassword(newPassword);

  await Users.updateOne(
    { _id: req.user.id },
    { password: encryptCurrentPassword },
    { new: true }
  );

  res.status(200).send({ message: "Password changed successfully" });
};

module.exports = changedPassword;

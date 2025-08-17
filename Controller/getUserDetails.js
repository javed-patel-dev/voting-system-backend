const Users = require("../Models/userSchema");
const { decryptPassword } = require("./passwordEncryptDecrypt");

const activeUser = async (req, res) => {
  try {
    let activeUser = await Users.find({ is_Active: true });
    for (let i = 0; i < activeUser.length; i++) {
      const decryptedPass = await decryptPassword(activeUser[i].password);
      activeUser[i].password = decryptedPass;
    }
    //activeUser.filter(item=>item.userType!=='Admin')
    if (activeUser.length == 0)
      return res.status(200).send({ message: "there is no active user" ,data:[]});
    
    //console.log([activeUser])
    res.status(200).send({ message: "fetch sucessfully", data: activeUser });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const pendingUser = async (req, res) => {
  try {
    let pendingUser = await Users.find({ is_Active: false });
    for (let i = 0; i < pendingUser.length; i++) {
      const decryptedPass = await decryptPassword(pendingUser[i].password);
      pendingUser[i].password = decryptedPass;
    }
    if (pendingUser.length == 0)
      return res.status(200).send({ message: "there is no pending user" ,data:[]});
   // pendingUser.filter(item=>item.userType!=='Admin')
    res.status(200).send({ message: "fetch sucessfully", data: pendingUser });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = { activeUser, pendingUser };

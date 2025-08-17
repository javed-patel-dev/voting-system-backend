const Users = require("../Models/userSchema");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const bcrypt = require("bcrypt");
const { decryptPassword } = require("./passwordEncryptDecrypt");
const mongoose = require("mongoose");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const axios = require("axios");

LoginUser = async (req, res) => {
  try {
    const email = req.body.email;
    let user = await Users.findOne({ email: email });
    // const isMatch = await bcrypt.compare(req.body.password, user.password);
    const userPassword = await decryptPassword(user.password);
    if (!user || userPassword !== req.body.password)
      return res.status(200).json({ error: "Invalid email or password" });

    if (user.userType === "user" && user.isLoggedIn === true)
      return res.status(200).send({ message: "User is logged in" });

    if (user.agreementAccepted === false)
      return res.status(200).send({
        message: "Agreement",
        data: {
          _id: user._id,
          name: user.name,
          startDate: user.startDate,
          address: user.address,
          aadharFront: user.aadharFront,
          aadharBack: user.aadharBack,
          signOfUser: user.signOfUser,
        },
      });

    if (user.is_Active === false)
      return res.status(200).send({ message: "Pending Approval" });

    const response = await axios.get("https://api.ipify.org?format=json");
    const publicIpAddress = response.data.ip || "192.143.56.101";

    await Users.findOneAndUpdate(
      { _id: user._id },
      { $set: { isLoggedIn: true, ipAddress: publicIpAddress } },
      { new: true }
    );

    user = await Users.findOne({ _id: user._id });
    res.status(200).send({
      message: `${user.name} has been logged in successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        startDate: user.startDate,
        endDate: user.endDate,
        address: user.address,
        aadharFront: user.aadharFront,
        aadharBack: user.aadharBack,
        signOfUser: user.signOfUser,
        wallet: user.wallet,
        completedWord: user.completedWork,
        pendingWork: user.pendingWork,
        isActive: user.is_Active,
        userType: user.userType,
        agreementAccepted: user.agreementAccepted,
        token: jwt.sign({ token: user._id }, process.env.JWT_SECRET_KEY),
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

trackLogin = async (req, res) => {
  try {
    const { _id, isLoggedIn } = req.body;

    if (!_id || typeof isLoggedIn !== "boolean" || !isValidObjectId(_id)) {
      return res.status(200).send({ success: false, error: "Invalid request" });
    }

    if (isLoggedIn) {
      const user = await Users.findByIdAndUpdate(_id, {
        $set: { isLoggedIn: false },
      });

      if (!user) {
        return res
          .status(200)
          .send({ success: false, error: "User not found" });
      }

      return res
        .status(200)
        .send({ success: true, message: "Logout successfully" });
    } else {
      return res
        .status(200)
        .send({ success: true, message: "User is already logged out" });
    }
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = { LoginUser, trackLogin };

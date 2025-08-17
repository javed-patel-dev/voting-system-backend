const Users = require("../Models/userSchema");

LogoutUser = async (req, res) => {
  try {
    await Users.updateOne(
      { _id: req.user._id },
      { $set: { isLoggedIn: false } }
    );

    // const token = localStorage.removeItem("token");
    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "this is error" + err.message });
  }
};

module.exports = LogoutUser;

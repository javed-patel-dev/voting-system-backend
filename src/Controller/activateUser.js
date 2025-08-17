const Users = require("../Models/userSchema");

activateUser = async (req, res) => {
  try {
    let id = req.body.email;
    let Activating_user = await Users.findOne({ email: id });
    if (!Activating_user)
      return res.status(404).send({ message: "User not found" });

    await Users.findOneAndUpdate(
      { _id: Activating_user._id },
      { is_Active: true },
      { new: true }
    );
    res.status(200).send({ message: "Activated sucessfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = activateUser;

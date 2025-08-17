const Users = require("../Models/userSchema");

agreementAccepted = async (req, res) => {
  try {
    let id = req.body.email;
    let user = await Users.findOne({ email: id });
    if (!user) return res.status(404).send({ message: "User not found" });

    await Users.findByIdAndUpdate(
      { _id: user._id },
      { agreementAccepted: true },
      { new: true }
    );
      
    res.status(200).send({ message: "you've accepted the agreement" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = agreementAccepted;

const Users = require("../Models/userSchema");

deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
    let user = await Users.findOne({ _id: id });

    if (!user) return res.status(404).send({ message: "Users not found" });

    await Users.findByIdAndDelete({ _id: id });

    res.status(200).send({ message: "User deleted successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "this is error" + err.message });
  }
};

module.exports = deleteUser;

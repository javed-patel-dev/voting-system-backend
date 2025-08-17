const Users = require("../Models/userSchema");

Submit = async (req, res) => {
  try {
    const min = 70;
    const max = 89;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const incAmount = randomNumber > 90 ? 30 : 5;

    const page = Number(req.body.page);
    const userId = req.body.id;

    const user = await Users.findById(userId);

    if (user.pendingWork.includes(page)) {
      await Users.findByIdAndUpdate(
        userId,
        {
          $inc: { wallet: incAmount },
          $push: { completedWork: page },
          $pull: { pendingWork: page },
        }
      );

      res.status(200).send({ incVal: incAmount });
    } else {
      res.status(200).send({ message: "Page number not found in pending work" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = Submit;

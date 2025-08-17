const Users = require("../Models/userSchema");
const QC = require("../Models/QCReportSchema");

deactivateUser = async (req, res) => {
  try {
    let email = req.body.email;
    let user = await Users.findOne({ email: email });

    if (!user) return res.status(404).send({ message: "Users not found" });

    await Users.updateOne(
      { _id: user._id },
      { $set: { is_Active: false } },
      { new: true }
    );

    let report = await QC.findOne({ email: email });
    
    if (report) {
      await QC.updateOne(
        { email: email },
        {
          $set: {
            completedWork: user.completedWork,
            pendingWork: user.pendingWork,
          },
        }
      );
    } else {
      let userObject = user.toObject(); // Convert the Mongoose document to a simple JavaScript object

      // Deleting unwanted fields
      delete userObject._id;
      delete userObject.createdAt;
      delete userObject.updatedAt;
      delete userObject.__v;

      let QCReport = new QC(userObject);
      QCReport.save();
    }

    res.status(200).send({
      message: "User Deactivated successfully & QC Report generated",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = deactivateUser;

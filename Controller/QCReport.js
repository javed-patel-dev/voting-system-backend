const QC = require("../Models/QCReportSchema");
const { decryptPassword } = require("./passwordEncryptDecrypt");

getQCReport = async (req, res) => {
  try {
    let qcReport = await QC.find();
    if (qcReport) {
      let data = await process(qcReport);
      res.status(200).send(data);
    } else {
      res.status(200).send({ message: "QC Not Generated" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
};

searchReport = async (req, res) => {
  try {
    const data = await QC.find({ email: { $regex: req.params.email, $options: 'i' } });
    res.status(200).send({ data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
};

async function process(data) {
  try {
    const DecryptData = await Promise.all(
      data.map(async (report) => {
        let password = await decryptPassword(report.password);
        report.password = password;
        return report;
      })
    );
    
    return DecryptData;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

module.exports = { getQCReport, searchReport };

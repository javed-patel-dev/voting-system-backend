const Contents = require("../Models/pdfSchema");

getPdfInPagination = async (req, res) => {
  try {
    let page = Number(req.params.page);
    let content = await Contents.findOne();
    res.status(200).send({"url":content.allPdf[page - 1]});
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
};

module.exports = getPdfInPagination;

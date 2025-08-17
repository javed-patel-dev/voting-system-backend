const Content = require("../Models/pdfSchema");
FormData = require("form-data");
const axios = require("axios");

pdfUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    const upload = async (savePath) => {
      try {
        const form = new FormData();
        form.append("file", fs.createReadStream(savePath));
        const result = await axios({
          method: "post",
          url: `${process.env.UPLOAD_FILE_URL}api/upload/`,
          data: form,
          headers: {
            "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
          },
        });
        await fs.unlinkSync(savePath);
        return result.data.file;
      } catch (error) {
        console.log("error", error);
        await fs.unlinkSync(savePath);
      }
    };
    const pdfAWSlink = await upload(req.file.path);
    const content = await Content.findOne();
    const pdfStorage = content.AllPDF.push(pdfAWSlink);

    await Content.findByIdAndUpdate(
      { _id: content._id },
      {
        $push: { AllPDF : pdfStorage },
      },
      { new: true }
    );

    res.status(200).send(file);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = pdfUpload;

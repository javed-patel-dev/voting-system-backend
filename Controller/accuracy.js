checkAccuracy = async (req, res) => {
  try {
    const path = require("path");
    const pdfjsLib = require("pdfjs-dist");

    console.log('pdfjsLib')
    // Define the PDF file path and the expected text string
    const filePath = path.join(
      __dirname,
      "..",
      "Images",
      "Osama-dv-resume.pdf"
    );
    const expectedText = "Osama Patel";

    // Load the PDF file
    const loadingTask = pdfjsLib.getDocument(filePath);
    loadingTask.promise.then((pdf) => {
      // Iterate over each page of the PDF file
      const numPages = pdf.numPages;
      let actualText = "";
      for (let i = 1; i <= numPages; i++) {
        const page = pdf.getPage(i);

        // Extract the text content of the page
        page.getTextContent().then((textContent) => {
          // Concatenate the text content of the page to the actual text string
          actualText += textContent.items.map((item) => item.str).join("");

          // Compare the actual text string with the expected text string
          if (actualText === expectedText) {
            console.log("The PDF file matches the expected text");
            res.status(200).send("matched");
          } else {
            console.log("The PDF file does not match the expected text");
            res.status(404).send("not matched");
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send({ message: `error: ${err.message}` });
  }
};

module.exports = checkAccuracy;

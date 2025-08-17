const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    allPdf: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contents", pdfSchema);


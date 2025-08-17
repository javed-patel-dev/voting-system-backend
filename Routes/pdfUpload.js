const pdfUpload = require("../Controller/pdfUpload");
const router = require("express").Router();

router.post("/", pdfUpload);

module.exports = router;


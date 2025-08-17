const getPdfInPagination = require("../Controller/getPdfInPagination")
const router = require("express").Router();

router.get("/:page", getPdfInPagination)

module.exports = router;
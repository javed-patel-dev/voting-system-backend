const {getQCReport, searchReport} = require("../Controller/QCReport")
const router = require("express").Router()

router.get("/", getQCReport);
router.get("/search/:email", searchReport);

module.exports = router;
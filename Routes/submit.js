const Submit = require("../Controller/submit");
const router = require("express").Router();

router.post("/", Submit);

module.exports = router;

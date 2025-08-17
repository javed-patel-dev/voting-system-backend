const sendMailSeparately = require("../Controller/sendMailSeparately");
const router = require("express").Router();

router.post("/", sendMailSeparately);

module.exports = router;

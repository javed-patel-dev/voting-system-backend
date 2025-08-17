const activateUser = require("../Controller/activateUser");
const router = require("express").Router();

router.post("/", activateUser);

module.exports = router;

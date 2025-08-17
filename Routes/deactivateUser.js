const deactivateUser = require("../Controller/deactivateUser");
const router = require("express").Router();

router.post("/", deactivateUser);

module.exports = router;

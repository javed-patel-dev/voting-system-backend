const createUser = require("../Controller/createUser");
const router = require("express").Router();

router.post("/", createUser);

module.exports = router;

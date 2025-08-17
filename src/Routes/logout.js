const LogoutUser = require("../Controller/logout");
const router = require("express").Router();

router.post("/logout", LogoutUser);

module.exports = router;

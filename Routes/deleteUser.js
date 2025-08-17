const deleteUser = require("../Controller/deleteUser");
const router = require("express").Router();

router.delete("/:id", deleteUser);

module.exports = router;

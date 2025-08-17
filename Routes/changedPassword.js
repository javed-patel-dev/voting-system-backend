const changedPassword = require("../Controller/changedPassword")
const router = require("express").Router()

router.post("/", changedPassword)

module.exports = router
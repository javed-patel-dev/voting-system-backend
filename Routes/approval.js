const Approval = require('../Controller/approval')
const router = require("express").Router();
router.get("/:email", Approval)

module.exports = router;
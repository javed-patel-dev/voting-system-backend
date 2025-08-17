const agrementAccepted = require("../Controller/agrementAccepted");
const router = require("express").Router();

router.put("/", agrementAccepted);

module.exports = router;

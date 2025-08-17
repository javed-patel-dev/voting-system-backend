const checkAccuracy = require('../Controller/accuracy');
const router = require('express').Router();

router.post('/', checkAccuracy)

module.exports = router; 
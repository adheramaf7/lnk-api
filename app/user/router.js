const router = require('express').Router();

const Controller = require('./controller');

router.get('/users', Controller.index);

module.exports = router;

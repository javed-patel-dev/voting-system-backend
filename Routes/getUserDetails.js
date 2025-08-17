const getUserDetails = require('../Controller/getUserDetails');
const activateUserRouter = require('express').Router();
const pendingUserRouter = require('express').Router();

activateUserRouter.get('/', getUserDetails.activeUser);
pendingUserRouter.get('/', getUserDetails.pendingUser);

module.exports = {
  activateUserRouter,
  pendingUserRouter
};
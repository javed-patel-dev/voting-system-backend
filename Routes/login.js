const Login = require("../Controller/login");
const LoginUser = require("express").Router();
const trackLogin = require("express").Router();

LoginUser.post("/", Login.LoginUser);
trackLogin.post("/", Login.trackLogin);

module.exports = {LoginUser, trackLogin};

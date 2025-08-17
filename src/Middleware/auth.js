const jwt = require("jsonwebtoken");
const Users = require("../Models/userSchema");
require("dotenv").config();

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(500).send({ message: "Invalid token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findById(decoded.token);
    if (!user) return res.status(500).send({ message: "Invalid token" });

    if (user.isLoggedIn === false)
      return res.status(403).send({ message: "You must be logged in" });

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Invalid token" });
    }
    res.status(400).send({ message: err.message });
  }
};
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(500).send("Invalid token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findById(decoded.token);
   
    if (!user) return res.status(500).send({ message: "Invalid token" });

    if (user.userType !== "Admin")
      return res.status(401).send({ message: "Not Authorized" });

    if (user.isLoggedIn === false)
      return res.status(403).send({ message: "You must be logged in" });

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Invalid token" });
    }
    res.status(400).send({ message: err.message });
  }
};

module.exports = { authenticateAdmin, authenticateUser };

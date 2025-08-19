import jwt from "jsonwebtoken";

export default class JWT {
  constructor(secret, expiresIn = "1h") {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  // Generate token
  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      return null; // or throw custom error
    }
  }

  // Decode without verifying (useful for debugging)
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }
}

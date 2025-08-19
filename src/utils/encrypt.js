import bcrypt from "bcrypt";

class Encrypt {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

// create a single instance (no need multiple)
export const encrypt = new Encrypt();

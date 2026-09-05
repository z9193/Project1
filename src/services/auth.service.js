const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { HttpError } = require("../middleware/errorHandler");
const userService = require("./users.service");

const SALT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function login(email, password) {
  const user = await userService.findByEmail(email);
  if (!user) {
    throw new HttpError(401, "Credenciales invalidas");
  }
  if (!user.is_active) {
    throw new HttpError(403, "Usuario desactivado");
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new HttpError(401, "Credenciales invalidas");
  }

  await userService.updateUser(user.id, { last_login: new Date().toISOString() });

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role?.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  const fresh = await userService.findById(user.id);
  return { token, user: fresh };
}

module.exports = { hashPassword, login };

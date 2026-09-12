const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { HttpError } = require("./errorHandler");
const userService = require("../services/users.service");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new HttpError(401, "Token requerido");
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new HttpError(401, "Sesion invalida");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof HttpError) {
      return next(err);
    }
    next(new HttpError(401, "Token invalido o expirado"));
  }
}

function requirePermission(...codes) {
  return (req, _res, next) => {
    const granted = new Set(req.user.permissions || []);
    const allowed = codes.every((code) => granted.has(code));
    if (!allowed) {
      return next(new HttpError(403, "No tienes permiso para esta accion"));
    }
    next();
  };
}

module.exports = { requireAuth, requirePermission };

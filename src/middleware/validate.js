const { HttpError } = require("./errorHandler");

function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length) {
    throw new HttpError(400, "Campos requeridos faltantes", { missing });
  }
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

module.exports = { requireFields, isEmail };

const asyncHandler = require("../middleware/asyncHandler");
const { requireFields, isEmail } = require("../middleware/validate");
const { HttpError } = require("../middleware/errorHandler");
const { publicUser } = require("../utils/serializers");
const userService = require("../services/users.service");
const authService = require("../services/auth.service");

const list = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  res.json({ users: users.map(publicUser) });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }
  res.json({ user: publicUser(user) });
});

const create = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password", "full_name", "role_id"]);
  const { email, password, full_name, role_id, is_active } = req.body;

  if (!isEmail(email)) {
    throw new HttpError(400, "Email invalido");
  }
  if (String(password).length < 8) {
    throw new HttpError(400, "La contrasena debe tener al menos 8 caracteres");
  }

  const existing = await userService.findByEmail(email);
  if (existing) {
    throw new HttpError(409, "El email ya esta registrado");
  }

  const user = await userService.createUser({
    email: email.toLowerCase().trim(),
    password_hash: await authService.hashPassword(password),
    full_name: String(full_name).trim(),
    role_id,
    is_active: is_active !== false,
  });

  res.status(201).json({ user: publicUser(user) });
});

const update = asyncHandler(async (req, res) => {
  const current = await userService.findById(req.params.id);
  if (!current) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  const payload = {};
  if (req.body.full_name !== undefined) {
    payload.full_name = String(req.body.full_name).trim();
  }
  if (req.body.email !== undefined) {
    if (!isEmail(req.body.email)) {
      throw new HttpError(400, "Email invalido");
    }
    payload.email = String(req.body.email).toLowerCase().trim();
  }
  if (req.body.role_id !== undefined) {
    payload.role_id = req.body.role_id;
  }
  if (req.body.is_active !== undefined) {
    payload.is_active = Boolean(req.body.is_active);
  }
  if (req.body.password) {
    if (String(req.body.password).length < 8) {
      throw new HttpError(400, "La contrasena debe tener al menos 8 caracteres");
    }
    payload.password_hash = await authService.hashPassword(req.body.password);
  }

  const user = await userService.updateUser(req.params.id, payload);
  res.json({ user: publicUser(user) });
});

const remove = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new HttpError(400, "No puedes eliminar tu propia cuenta");
  }
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };

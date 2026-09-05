const asyncHandler = require("../middleware/asyncHandler");
const { requireFields, isEmail } = require("../middleware/validate");
const { HttpError } = require("../middleware/errorHandler");
const { publicUser } = require("../utils/serializers");
const authService = require("../services/auth.service");

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);
  const { email, password } = req.body;
  if (!isEmail(email)) {
    throw new HttpError(400, "Email invalido");
  }

  const result = await authService.login(email, password);
  res.json({
    token: result.token,
    token_type: "Bearer",
    user: publicUser(result.user),
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { login, me };

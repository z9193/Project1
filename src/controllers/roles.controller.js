const asyncHandler = require("../middleware/asyncHandler");
const { requireFields } = require("../middleware/validate");
const { HttpError } = require("../middleware/errorHandler");
const rolesService = require("../services/roles.service");

const list = asyncHandler(async (_req, res) => {
  const roles = await rolesService.listRoles();
  res.json({ roles });
});

const permissions = asyncHandler(async (_req, res) => {
  const items = await rolesService.listPermissions();
  res.json({ permissions: items });
});

const setPermissions = asyncHandler(async (req, res) => {
  requireFields(req.body, ["permission_ids"]);
  if (!Array.isArray(req.body.permission_ids)) {
    throw new HttpError(400, "permission_ids debe ser un arreglo");
  }
  const role = await rolesService.setRolePermissions(
    req.params.id,
    req.body.permission_ids
  );
  res.json({ role });
});

module.exports = { list, permissions, setPermissions };

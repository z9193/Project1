const { Router } = require("express");
const rolesController = require("../controllers/roles.controller");
const { requirePermission } = require("../middleware/auth");

const router = Router();

router.get("/", requirePermission("roles.read"), rolesController.list);
router.get(
  "/permissions",
  requirePermission("roles.read"),
  rolesController.permissions
);
router.put(
  "/:id/permissions",
  requirePermission("roles.write"),
  rolesController.setPermissions
);

module.exports = router;

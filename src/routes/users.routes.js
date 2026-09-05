const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const { requirePermission } = require("../middleware/auth");

const router = Router();

router.get("/", requirePermission("users.read"), usersController.list);
router.get("/:id", requirePermission("users.read"), usersController.getById);
router.post("/", requirePermission("users.write"), usersController.create);
router.patch("/:id", requirePermission("users.write"), usersController.update);
router.delete("/:id", requirePermission("users.delete"), usersController.remove);

module.exports = router;

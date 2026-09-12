const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { requirePermission } = require("../middleware/auth");

const router = Router();

router.get(
  "/summary",
  requirePermission("users.read"),
  dashboardController.summary
);

module.exports = router;

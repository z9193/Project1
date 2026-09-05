const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const rolesRoutes = require("./roles.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = Router();

router.post("/login", authController.login);
router.use("/auth", authRoutes);
router.use("/users", requireAuth, usersRoutes);
router.use("/roles", requireAuth, rolesRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);

module.exports = router;

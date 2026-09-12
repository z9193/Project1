const asyncHandler = require("../middleware/asyncHandler");
const userService = require("../services/users.service");
const rolesService = require("../services/roles.service");

const summary = asyncHandler(async (_req, res) => {
  const [users, roles] = await Promise.all([
    userService.listUsers(),
    rolesService.listRoles(),
  ]);

  res.json({
    totals: {
      users: users.length,
      active_users: users.filter((user) => user.is_active).length,
      roles: roles.length,
    },
  });
});

module.exports = { summary };

const supabase = require("../config/supabase");
const { HttpError } = require("../middleware/errorHandler");

async function listRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select(
      `
      id,
      name,
      description,
      created_at,
      role_permissions (
        permission:permissions (
          id,
          code,
          description
        )
      )
    `
    )
    .order("name");

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data || []).map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    created_at: role.created_at,
    permissions: (role.role_permissions || [])
      .map((row) => row.permission)
      .filter(Boolean),
  }));
}

async function listPermissions() {
  const { data, error } = await supabase
    .from("permissions")
    .select("id, code, description")
    .order("code");

  if (error) {
    throw new HttpError(500, error.message);
  }
  return data || [];
}

async function setRolePermissions(roleId, permissionIds) {
  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) {
    throw new HttpError(500, deleteError.message);
  }

  if (permissionIds.length) {
    const rows = permissionIds.map((permission_id) => ({
      role_id: roleId,
      permission_id,
    }));
    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(rows);

    if (insertError) {
      throw new HttpError(400, insertError.message);
    }
  }

  const roles = await listRoles();
  const role = roles.find((item) => item.id === roleId);
  if (!role) {
    throw new HttpError(404, "Rol no encontrado");
  }
  return role;
}

module.exports = { listRoles, listPermissions, setRolePermissions };

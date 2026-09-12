const supabase = require("../config/supabase");
const { HttpError } = require("../middleware/errorHandler");

const USER_SELECT = `
  id,
  email,
  password_hash,
  full_name,
  is_active,
  last_login,
  created_at,
  updated_at,
  role:roles (
    id,
    name,
    description
  )
`;

async function throwIfError(error, fallbackStatus = 500) {
  if (!error) return;
  if (error.code === "23505") {
    throw new HttpError(409, "El registro ya existe");
  }
  throw new HttpError(fallbackStatus, error.message);
}

async function permissionCodesForRole(roleId) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission:permissions(code)")
    .eq("role_id", roleId);

  await throwIfError(error);
  return (data || [])
    .map((row) => row.permission?.code)
    .filter(Boolean);
}

async function hydrate(user) {
  if (!user) return null;
  const permissions = user.role?.id
    ? await permissionCodesForRole(user.role.id)
    : [];
  return { ...user, permissions };
}

async function findByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  await throwIfError(error);
  return hydrate(data);
}

async function findById(id) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", id)
    .maybeSingle();

  await throwIfError(error);
  return hydrate(data);
}

async function listUsers() {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .order("created_at", { ascending: false });

  await throwIfError(error);
  return Promise.all((data || []).map(hydrate));
}

async function createUser(payload) {
  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select(USER_SELECT)
    .single();

  await throwIfError(error);
  return hydrate(data);
}

async function updateUser(id, payload) {
  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)
    .select(USER_SELECT)
    .maybeSingle();

  await throwIfError(error);
  if (!data) {
    throw new HttpError(404, "Usuario no encontrado");
  }
  return hydrate(data);
}

async function deleteUser(id) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  await throwIfError(error);
  if (!data) {
    throw new HttpError(404, "Usuario no encontrado");
  }
}

module.exports = {
  findByEmail,
  findById,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};

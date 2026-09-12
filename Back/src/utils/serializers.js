function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    is_active: user.is_active,
    last_login: user.last_login,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
        }
      : null,
    permissions: user.permissions || [],
  };
}

module.exports = { publicUser };

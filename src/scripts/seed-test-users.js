require("dotenv").config();

const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const TEST_USERS = [
  {
    email: "operador@hmdp.local",
    password: "Test1234",
    full_name: "Maria Operador",
    role: "operador",
  },
  {
    email: "supervisor@hmdp.local",
    password: "Test1234",
    full_name: "Luis Supervisor",
    role: "supervisor",
  },
];

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  for (const user of TEST_USERS) {
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", user.role)
      .single();

    if (roleError || !role) {
      throw new Error(`Rol no encontrado: ${user.role}`);
    }

    const password_hash = await bcrypt.hash(user.password, 12);
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("users")
        .update({
          password_hash,
          full_name: user.full_name,
          role_id: role.id,
          is_active: true,
        })
        .eq("id", existing.id);
      if (error) throw error;
      console.log(`Actualizado: ${user.email} (${user.role})`);
      continue;
    }

    const { error } = await supabase.from("users").insert({
      email: user.email,
      password_hash,
      full_name: user.full_name,
      role_id: role.id,
      is_active: true,
    });
    if (error) throw error;
    console.log(`Creado: ${user.email} (${user.role})`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

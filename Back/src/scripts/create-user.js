require("dotenv").config();

const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const email = (process.env.NEW_USER_EMAIL || "ana.garcia@hmdp.local").toLowerCase();
const password = process.env.NEW_USER_PASSWORD || "Ana12345";
const fullName = process.env.NEW_USER_NAME || "Ana Garcia";
const roleName = process.env.NEW_USER_ROLE || "operador";

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, name")
    .eq("name", roleName)
    .single();

  if (roleError || !role) {
    throw new Error(`Rol no encontrado: ${roleName}`);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({
        password_hash,
        full_name: fullName,
        role_id: role.id,
        is_active: true,
      })
      .eq("id", existing.id);

    if (error) throw error;
    console.log(`Actualizado: ${email} (${role.name})`);
  } else {
    const { error } = await supabase.from("users").insert({
      email,
      password_hash,
      full_name: fullName,
      role_id: role.id,
      is_active: true,
    });

    if (error) throw error;
    console.log(`Creado: ${email} (${role.name})`);
  }

  const { data: saved, error: readError } = await supabase
    .from("users")
    .select("id, email, full_name, is_active, created_at, role:roles(name)")
    .eq("email", email)
    .single();

  if (readError || !saved) {
    throw new Error("El usuario no se encontro despues de guardar");
  }

  console.log("Confirmado en BD:");
  console.log(JSON.stringify(saved, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

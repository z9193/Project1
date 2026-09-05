require("dotenv").config();

const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const email = (process.env.ADMIN_EMAIL || "admin@hmdp.local").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Admin1234";
const fullName = process.env.ADMIN_NAME || "Administrador";

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
    .select("id")
    .eq("name", "admin")
    .single();

  if (roleError || !role) {
    throw new Error(
      "No se encontro el rol admin. Ejecuta supabase/schema.sql primero."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        full_name: fullName,
        role_id: role.id,
        is_active: true,
      })
      .eq("id", existing.id);

    if (error) throw error;
    console.log(`Admin actualizado: ${email}`);
    return;
  }

  const { error } = await supabase.from("users").insert({
    email,
    password_hash: passwordHash,
    full_name: fullName,
    role_id: role.id,
    is_active: true,
  });

  if (error) throw error;
  console.log(`Admin creado: ${email}`);
  console.log("Cambia la contrasena despues del primer inicio de sesion.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

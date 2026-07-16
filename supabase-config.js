// ============================================================
// Configuración de Supabase — usada por productos.html y admin.html
//
// Reemplaza los dos valores de abajo con los de tu proyecto:
// Supabase → tu proyecto → Settings (ícono de engranaje) → API
//   - "Project URL"        → SUPABASE_URL
//   - "anon public" key    → SUPABASE_ANON_KEY
//
// Esta clave "anon" está diseñada para ser pública (vive en el
// navegador de cualquier visitante) — la seguridad real la dan
// las políticas RLS que creaste en supabase-schema.sql, no el
// hecho de que esta clave esté oculta.
// ============================================================

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-PUBLICA';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

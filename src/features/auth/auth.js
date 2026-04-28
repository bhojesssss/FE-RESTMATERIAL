// src/features/auth/auth.js
import { supabase } from "../../services/supabase";
import { request } from "../../services/api";

const SESSION_KEY = "rm_session_v1";
const TOKEN_KEY = "rm_token";

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getCachedSession() {
  return safeJsonParse(localStorage.getItem(SESSION_KEY), null);
}

// FIX: Helper simpan session + notify semua listener (termasuk Navbar)
// Native 'storage' event tidak fire di tab yang sama, jadi kita dispatch
// custom event 'rm:auth:changed' untuk same-tab updates
function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("rm:auth:changed"));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("rm:auth:changed"));
}

// ─── Session ────────────────────────────────────────────────────────────────

export async function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return getCachedSession();

  try {
    const data = await request("/users/me");
    const p = data.profile;
    const cached = getCachedSession();

    const session = {
      userId: p.id,
      id: p.id,
      full_name: p.full_name,
      name: p.full_name,
      email: cached?.email || p.email || "",
      phone: p.phone || "",
      bio: p.bio || "",
      address: p.address || "",
      city: p.city || "",
      province: p.province || "",
      role: p.role || "BUYER",
      avatar_url: p.avatar_url || "",
      rating_avg: p.rating_avg || 0,
      total_reviews: p.total_reviews || 0,
      loggedInAt: cached?.loggedInAt || new Date().toISOString(),
    };
    saveSession(session);
    return session;
  } catch {
    return getCachedSession();
  }
}

export function logout() {
  clearSession();
  supabase.auth.signOut().catch(() => {});
}

// ─── Register ───────────────────────────────────────────────────────────────

export async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    if (error.message?.includes("already registered")) {
      throw new Error("Email sudah terdaftar. Coba login.");
    }
    throw new Error(error.message || "Registrasi gagal.");
  }

  const token = data.session?.access_token;
  if (token) localStorage.setItem(TOKEN_KEY, token);

  const session = {
    userId: data.user.id,
    id: data.user.id,
    full_name: name,
    name,
    email: data.user.email,
    role: "BUYER",
    loggedInAt: new Date().toISOString(),
  };
  saveSession(session); // → dispatch 'rm:auth:changed' → Navbar update
  return session;
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message?.includes("Invalid login credentials") ||
      error.message?.includes("invalid_credentials")
    ) {
      throw new Error("Email atau password salah.");
    }
    throw new Error(error.message || "Login gagal.");
  }

  const token = data.session.access_token;
  localStorage.setItem(TOKEN_KEY, token);

  const session = {
    userId: data.user.id,
    id: data.user.id,
    full_name: data.user.user_metadata?.name || email,
    name: data.user.user_metadata?.name || email,
    email: data.user.email,
    role: "BUYER",
    loggedInAt: new Date().toISOString(),
  };
  saveSession(session); // → dispatch 'rm:auth:changed' → Navbar update
  return session;
}

// ─── Update Profile (PATCH /users/me) ───────────────────────────────────────

export async function updateUser(userId, formData) {
  const session = getCachedSession();
  if (!session || session.userId !== userId) {
    throw new Error("User not found");
  }

  // Build payload sesuai BE: full_name, phone, bio, address, city, province, role
  const payload = {};
  if (formData.name !== undefined)
    payload.full_name = String(formData.name).trim();
  if (formData.city !== undefined) payload.city = String(formData.city).trim();
  if (formData.phone !== undefined)
    payload.phone = String(formData.phone).trim();
  if (formData.bio !== undefined) payload.bio = String(formData.bio).trim();
  if (formData.address !== undefined)
    payload.address = String(formData.address).trim();
  if (formData.province !== undefined)
    payload.province = String(formData.province).trim();
  if (formData.role !== undefined) payload.role = formData.role;

  try {
    const data = await request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const p = data.profile;
    const nextSession = {
      ...session,
      full_name: p.full_name || session.full_name,
      name: p.full_name || session.name,
      phone: p.phone ?? session.phone,
      bio: p.bio ?? session.bio,
      address: p.address ?? session.address,
      city: p.city ?? session.city,
      province: p.province ?? session.province,
      role: p.role ?? session.role,
      avatar_url: p.avatar_url ?? session.avatar_url,
    };
    saveSession(nextSession);
    return nextSession;
  } catch (err) {
    // Fallback: update local saja kalau BE unreachable
    console.log("[updateUser] BE unreachable, fallback ke local:", err.message);
    const nextSession = {
      ...session,
      full_name:
        formData.name !== undefined
          ? String(formData.name).trim()
          : session.full_name,
      name:
        formData.name !== undefined
          ? String(formData.name).trim()
          : session.name,
      city:
        formData.city !== undefined
          ? String(formData.city).trim()
          : session.city,
      phone:
        formData.phone !== undefined
          ? String(formData.phone).trim()
          : session.phone,
      role: formData.role !== undefined ? formData.role : session.role,
      address:
        formData.address !== undefined
          ? String(formData.address).trim()
          : session.address,
      province:
        formData.province !== undefined
          ? String(formData.province).trim()
          : session.province,
    };
    saveSession(nextSession);
    return nextSession;
  }
}

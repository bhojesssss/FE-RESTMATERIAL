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

// ─── Session ────────────────────────────────────────────────────────────────

export async function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return getCachedSession();

  try {
    // Coba ambil profile dari BE (butuh token valid)
    const profile = await request("/auth/me");
    const session = {
      ...profile,
      userId: profile.id,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    // BE tidak reachable atau token expired — fallback ke cache
    return getCachedSession();
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  // Juga sign out dari Supabase supaya session Supabase ikut bersih
  supabase.auth.signOut().catch(() => {});
}

// ─── Register ───────────────────────────────────────────────────────────────

export async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // disimpan ke user_metadata Supabase
    },
  });

  if (error) {
    // Translate pesan error Supabase supaya user-friendly
    if (error.message?.includes("already registered")) {
      throw new Error("Email sudah terdaftar. Coba login.");
    }
    throw new Error(error.message || "Registrasi gagal.");
  }

  // Supabase bisa return session null kalau email confirmation aktif
  const token = data.session?.access_token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  const session = {
    userId: data.user.id,
    id: data.user.id,
    name,
    email: data.user.email,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Translate pesan error Supabase supaya user-friendly
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
    name: data.user.user_metadata?.name || email,
    email: data.user.email,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ─── Update Profile (local fallback, BE endpoint belum ada) ─────────────────

export function updateUser(userId, data) {
  const session = getCachedSession();
  if (!session || session.userId !== userId) {
    throw new Error("User not found");
  }

  const nextSession = {
    ...session,
    name: data.name !== undefined ? String(data.name).trim() : session.name,
    city: data.city !== undefined ? String(data.city).trim() : session.city,
    phone: data.phone !== undefined ? String(data.phone).trim() : session.phone,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  return nextSession;
}

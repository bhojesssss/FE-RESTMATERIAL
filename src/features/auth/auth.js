import { request } from "../../services/api";
import { supabase } from "../../services/supabase";

const USERS_KEY = "rm_users_v1";
const SESSION_KEY = "rm_session_v1";
const TOKEN_KEY = "rm_token";

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getUsers() {
  return safeJsonParse(localStorage.getItem(USERS_KEY), []);
}

export function getCachedSession() {
  return safeJsonParse(localStorage.getItem(SESSION_KEY), null);
}

export async function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return getCachedSession(); // Fallback to local session if no token

  try {
    const profile = await request("/auth/me");
    const session = {
      ...profile,
      userId: profile.id,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    // If validation fails (e.g. 401), request handler already cleans token and session
    return getCachedSession();
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }, // disimpan ke user_metadata
  });
  if (error) throw error;

  const token = data.session?.access_token;
  if (token) localStorage.setItem(TOKEN_KEY, token);

  const session = {
    ...data.user,
    userId: data.user.id,
    name,
    email,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const token = data.session.access_token;
  localStorage.setItem(TOKEN_KEY, token);

  const session = {
    ...data.user,
    userId: data.user.id,
    name: data.user.user_metadata?.name || email,
    email,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function updateUser(userId, data) {
  try {
    const profile = await request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const session = getCachedSession();
    if (session) {
      const nextSession = { ...session, ...profile };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      return nextSession;
    }
  } catch (err) {
    console.warn("Fallback to local update user");
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = users[userIndex];
    const updatedUser = {
      ...user,
      name: data.name !== undefined ? String(data.name).trim() : user.name,
      city: data.city !== undefined ? String(data.city).trim() : user.city,
      phone: data.phone !== undefined ? String(data.phone).trim() : user.phone,
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session = getCachedSession();
    if (session && session.userId === userId) {
      const nextSession = {
        ...session,
        name: updatedUser.name,
        city: updatedUser.city,
        phone: updatedUser.phone,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      return nextSession;
    }
    return null;
  }
}

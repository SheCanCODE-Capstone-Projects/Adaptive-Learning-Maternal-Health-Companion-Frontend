const base = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
export const sessionKey = "maternacare.session";

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(sessionKey)); }
  catch { return null; }
}

export async function request(path, { method = "GET", body, signal, anonymous = false } = {}) {
  const session = anonymous ? null : getSession();
  const response = await fetch(base + path, {
    method, signal, cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && session && getSession()?.token === session.token) {
      window.dispatchEvent(new Event("materna-session-expired"));
    }
    const error = new Error(data?.message || data?.detail || data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export const loginUser = (body) => request("/auth/login", { method: "POST", body, anonymous: true });
export const registerUser = (body) => request("/auth/register", { method: "POST", body, anonymous: true });

const base = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
export const sessionKey = "maternacare.session";

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(sessionKey)); }
  catch { return null; }
}

const genericReasons = new Set(["Bad Request", "Unauthorized", "Forbidden", "Not Found", "Conflict", "Internal Server Error"]);

function errorMessage(path, status, data) {
  const candidates = [data?.message, data?.detail, data?.error?.message, data?.error, data?.errors?.[0]?.defaultMessage, data?.errors?.[0]?.message];
  const specific = candidates.find(value => typeof value === "string" && value.trim() && !genericReasons.has(value.trim()));
  if (specific) return specific;
  if (path.startsWith("/auth/register")) {
    if (status === 409) return "An account with this email already exists. Sign in instead.";
    if (status === 400) return "Check your details: enter your full name, a valid email and a password of at least 8 characters.";
  }
  if (path.startsWith("/auth/login") && (status === 401 || status === 400)) return "The email or password is not correct.";
  if (status === 401) return "Your session has ended. Sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "The service could not be reached. Please try again later.";
  if (status === 409) return "This change conflicts with newer information. Refresh and try again.";
  if (status === 429) return "Too many attempts. Wait a moment and try again.";
  if (status >= 500) return "The server had a problem. Please try again in a few minutes.";
  return `Something went wrong (${status}). Please try again.`;
}

export async function request(path, { method = "GET", body, signal, anonymous = false } = {}) {
  const session = anonymous ? null : getSession();
  let response;
  try {
    response = await fetch(base + path, {
      method, signal, cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (cause) {
    if (signal?.aborted || cause?.name === "AbortError") throw cause;
    const error = new TypeError(navigator.onLine
      ? "MaternaCare could not reach the server. Check your connection and try again."
      : "You are offline. Connect to the internet and try again.");
    error.network = true;
    throw error;
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && session && getSession()?.token === session.token) {
      window.dispatchEvent(new Event("materna-session-expired"));
    }
    const error = new Error(errorMessage(path, response.status, data));
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export const loginUser = (body) => request("/auth/login", { method: "POST", body, anonymous: true });
export const registerUser = (body) => request("/auth/register", { method: "POST", body, anonymous: true });

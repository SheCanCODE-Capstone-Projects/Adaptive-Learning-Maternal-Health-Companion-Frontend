
const API_BASE_URL = "https://mamajourney-api.onrender.com";

// Get the saved authentication token
function getToken() {
  return localStorage.getItem("token");
}

// Common function for sending API requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed: ${response.status}`
    );
  }

  return data;
}

// Authentication
export function registerUser(userData) {
  return apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// Account
export function deleteAccount() {
  return apiRequest("/api/v1/account", {
    method: "DELETE",
  });
}

// Appointments
export function getAppointments() {
  return apiRequest("/api/v1/appointments");
}

export function addAppointment(appointmentData) {
  return apiRequest("/api/v1/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}

export function updateAppointment(id, appointmentData) {
  return apiRequest(`/api/v1/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
  });
}

export function deleteAppointment(id) {
  return apiRequest(`/api/v1/appointments/${id}`, {
    method: "DELETE",
  });
}

export function syncAppointments(offlineData) {
  return apiRequest("/api/v1/appointments/sync", {
    method: "POST",
    body: JSON.stringify(offlineData),
  });
}

// Consent
export function getConsents() {
  return apiRequest("/api/v1/consents");
}

export function saveConsent(consentData) {
  return apiRequest("/api/v1/consents", {
    method: "POST",
    body: JSON.stringify(consentData),
  });
}

// Diary
export function getDiaryNotes() {
  return apiRequest("/api/diary/notes");
}

export function saveDiaryNote(noteData) {
  return apiRequest("/api/diary/notes", {
    method: "POST",
    body: JSON.stringify(noteData),
  });
}

// Maternal care timeline
export function getTimeline() {
  return apiRequest("/api/v1/timeline");
}

export function saveTimeline(timelineData) {
  return apiRequest("/api/v1/timeline", {
    method: "PUT",
    body: JSON.stringify(timelineData),
  });
}

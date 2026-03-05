const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export function getAuthHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const headers = new Headers(extraHeaders);
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("studydone-access-token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...init,
    headers: getAuthHeaders(init.headers),
  });
}


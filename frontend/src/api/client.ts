const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

/**
 * Wrapper delgado sobre fetch: arma la URL completa, agrega el header
 * de autenticación si hay token, y traduce las respuestas de error del
 * backend ({ error: true, message: "..." }) a un ApiError con el
 * mensaje real que ya viene en español desde errorHandler.ts.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = (data && data.message) || "Ocurrió un error inesperado.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}
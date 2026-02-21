// ─── Response types (mirror what each route returns) ────────────────────────

export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  movie: string | null;
};

export type Fact = {
  id: string;
  content: string;
  createdAt: string; // ISO string over the wire
  cached?: boolean;  // true when OpenAI failed and we returned a stored fact
};

// ─── Typed error ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core fetch helper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // Parse the body regardless — error responses also contain a JSON message
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `Request failed with status ${res.status}`,
    );
  }

  return body as T;
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const api = {
  /** GET /api/me — fetch the current user's profile */
  getMe(): Promise<User> {
    return request<User>("/api/me");
  },

  /** PUT /api/me/movie — update the current user's favorite movie */
  updateMovie(movie: string): Promise<Pick<User, "id" | "movie">> {
    return request<Pick<User, "id" | "movie">>("/api/me/movie", {
      method: "PUT",
      body: JSON.stringify({ movie }),
    });
  },

  /** GET /api/fact — generate (or retrieve cached) a fun fact */
  getFact(): Promise<Fact> {
    return request<Fact>("/api/fact");
  },
};

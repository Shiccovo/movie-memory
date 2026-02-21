import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, ApiError } from "@/lib/api";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// Use mockImplementation so a fresh Response is created for every fetch call.
// mockResolvedValue reuses the same Response instance — once the body is read
// the first time, subsequent reads return empty, causing the wrong error message.
function mockFetch(status: number, body: unknown) {
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("api client — error handling", () => {
  it("throws ApiError with status 401 and correct message", async () => {
    mockFetch(401, { error: "Unauthorized" });

    try {
      await api.getMe();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
      expect((err as ApiError).message).toBe("Unauthorized");
    }
  });

  it("throws ApiError with status 500 on internal server error", async () => {
    mockFetch(500, { error: "Internal server error" });

    await expect(api.getMe()).rejects.toBeInstanceOf(ApiError);
    await expect(api.getMe()).rejects.toMatchObject({ status: 500 });
  });

  it("includes the server error message in ApiError", async () => {
    mockFetch(422, { error: "Movie name is required" });

    try {
      await api.updateMovie("");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe("Movie name is required");
      expect((err as ApiError).status).toBe(422);
    }
  });

  it("returns typed data on a successful response", async () => {
    const mockUser = {
      id: "user-1",
      name: "Jane",
      email: "jane@example.com",
      image: null,
      movie: "Inception",
    };
    mockFetch(200, mockUser);

    const user = await api.getMe();
    expect(user).toEqual(mockUser);
  });

  it("uses fallback error message when response body has no error field", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response("not json", { status: 503 })),
    );

    await expect(api.getFact()).rejects.toMatchObject({
      status: 503,
      message: "Request failed with status 503",
    });
  });
});

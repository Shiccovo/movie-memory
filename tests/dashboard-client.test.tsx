import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardClient from "@/app/dashboard/dashboard-client";
import { api, ApiError } from "@/lib/api";

// Keep the real ApiError class so instanceof checks inside the component work.
// Only mock the api methods.
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: {
      getFact: vi.fn(),
      updateMovie: vi.fn(),
      getMe: vi.fn(),
    },
  };
});

const defaultFact = {
  id: "fact-1",
  content: "A great fact.",
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  // Clear call counts and return values between tests
  vi.clearAllMocks();
  // Every render triggers getFact on mount — resolve it silently by default
  vi.mocked(api.getFact).mockResolvedValue(defaultFact);
});

describe("DashboardClient — movie edit flow", () => {
  it("displays the initial movie and an Edit button", async () => {
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("clicking Edit shows an input pre-filled with the current movie", async () => {
    const user = userEvent.setup();
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByRole("textbox")).toHaveValue("Inception");
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("Cancel restores the original movie without calling the API", async () => {
    const user = userEvent.setup();
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Interstellar");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(api.updateMovie).not.toHaveBeenCalled();
  });

  it("optimistically shows new movie immediately after Save", async () => {
    vi.mocked(api.updateMovie).mockResolvedValue({
      id: "user-1",
      movie: "Interstellar",
    });

    const user = userEvent.setup();
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Interstellar");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(screen.getByText("Interstellar")).toBeInTheDocument(),
    );
  });

  it("shows error and reopens editor when server rejects the save", async () => {
    vi.mocked(api.updateMovie).mockRejectedValue(
      new ApiError(500, "Internal server error"),
    );

    const user = userEvent.setup();
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Interstellar");
    await user.click(screen.getByRole("button", { name: /save/i }));

    // Error alert is shown
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Internal server error"),
    );

    // Editor is reopened so user can retry (input is visible)
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows validation error for empty movie name without calling API", async () => {
    const user = userEvent.setup();
    render(<DashboardClient userId="user-1" initialMovie="Inception" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("required");
    expect(api.updateMovie).not.toHaveBeenCalled();
  });
});

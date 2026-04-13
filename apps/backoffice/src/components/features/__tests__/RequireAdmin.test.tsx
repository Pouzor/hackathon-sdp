import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "../RequireAdmin";

// Mock useAuth so we can control what it returns
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";
const mockUseAuth = vi.mocked(useAuth);

describe("RequireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRouter(initialPath = "/admin") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      logout: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows access denied when authenticated but not admin", () => {
    mockUseAuth.mockReturnValue({
      user: {
        email: "jean@eleven-labs.com",
        astronaut_id: 1,
        roles: ["astronaut"],
        planet_id: null,
      },
      isAuthenticated: true,
      isAdmin: false,
      logout: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText(/Accès refusé/)).toBeInTheDocument();
  });

  it("renders the outlet when authenticated as admin", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@eleven-labs.com", astronaut_id: 1, roles: ["admin"], planet_id: null },
      isAuthenticated: true,
      isAdmin: true,
      logout: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });
});

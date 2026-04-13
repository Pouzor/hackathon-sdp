import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AdminLayout } from "./AdminLayout";
import * as useAuthModule from "@/hooks/useAuth";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: { email: "admin@eleven-labs.com", astronaut_id: 1, roles: ["admin"], planet_id: null },
      isAuthenticated: true,
      isAdmin: true,
      logout: vi.fn(),
    });
  });

  it("affiche la sidebar avec la navigation admin", () => {
    render(<AdminLayout />, { wrapper });
    expect(screen.getByText("Site des Planètes")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Astronautes")).toBeInTheDocument();
    expect(screen.getByText("Attribuer des points")).toBeInTheDocument();
    expect(screen.getByText("admin@eleven-labs.com")).toBeInTheDocument();
  });
});

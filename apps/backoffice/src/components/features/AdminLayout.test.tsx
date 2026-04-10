import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminLayout", () => {
  it("affiche la sidebar avec la navigation admin", () => {
    render(<AdminLayout />, { wrapper });
    expect(screen.getByText("Admin — Planètes")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Astronautes")).toBeInTheDocument();
    expect(screen.getByText("Attribuer des points")).toBeInTheDocument();
  });
});

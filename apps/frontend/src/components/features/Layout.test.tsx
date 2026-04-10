import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./Layout";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Layout", () => {
  it("affiche le header avec le titre", () => {
    render(<Layout />, { wrapper });
    expect(screen.getByText("Site des Planètes")).toBeInTheDocument();
  });

  it("affiche le footer", () => {
    render(<Layout />, { wrapper });
    expect(screen.getByText(/Eleven Labs/i)).toBeInTheDocument();
  });
});

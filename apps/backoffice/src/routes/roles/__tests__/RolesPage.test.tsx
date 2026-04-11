import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RolesPage } from "../RolesPage";
import * as astronautsApi from "@/api/astronauts";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockAstronauts: astronautsApi.AstronautOut[] = [
  {
    id: 1,
    email: "admin@eleven-labs.com",
    first_name: "Alice",
    last_name: "Admin",
    photo_url: null,
    roles: ["astronaut", "admin"],
    planet_id: 1,
    total_points: 500,
  },
  {
    id: 2,
    email: "bob@eleven-labs.com",
    first_name: "Bob",
    last_name: "Dupont",
    photo_url: null,
    roles: ["astronaut"],
    planet_id: 2,
    total_points: 100,
  },
];

describe("RolesPage", () => {
  beforeEach(() => {
    localStorage.removeItem("auth_token");
    vi.restoreAllMocks();
  });

  it("affiche la liste des astronautes avec leurs rôles", () => {
    vi.spyOn(astronautsApi, "useAstronauts").mockReturnValue({
      data: mockAstronauts,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof astronautsApi.useAstronauts>);
    vi.spyOn(astronautsApi, "useUpdateRoles").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateRoles>);

    render(<RolesPage />, { wrapper });

    expect(screen.getByText("alice admin", { exact: false }) ?? screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("bob@eleven-labs.com")).toBeInTheDocument();
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Astronaute").length).toBeGreaterThanOrEqual(1);
  });

  it("affiche un spinner pendant le chargement", () => {
    vi.spyOn(astronautsApi, "useAstronauts").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof astronautsApi.useAstronauts>);
    vi.spyOn(astronautsApi, "useUpdateRoles").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateRoles>);

    render(<RolesPage />, { wrapper });

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", () => {
    vi.spyOn(astronautsApi, "useAstronauts").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof astronautsApi.useAstronauts>);
    vi.spyOn(astronautsApi, "useUpdateRoles").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateRoles>);

    render(<RolesPage />, { wrapper });

    expect(screen.getByText(/erreur/i)).toBeInTheDocument();
  });

  it("ouvre la dialog de confirmation au clic sur Promouvoir", () => {
    vi.spyOn(astronautsApi, "useAstronauts").mockReturnValue({
      data: mockAstronauts,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof astronautsApi.useAstronauts>);
    vi.spyOn(astronautsApi, "useUpdateRoles").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateRoles>);

    render(<RolesPage />, { wrapper });

    fireEvent.click(screen.getByText("Promouvoir admin"));

    expect(screen.getByText(/confirmer la modification/i)).toBeInTheDocument();
    // bob@eleven-labs.com apparaît dans la table ET dans la dialog
    expect(screen.getAllByText("bob@eleven-labs.com").length).toBeGreaterThanOrEqual(1);
  });

  it("annule la dialog sans appeler mutate", () => {
    const mutate = vi.fn();
    vi.spyOn(astronautsApi, "useAstronauts").mockReturnValue({
      data: mockAstronauts,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof astronautsApi.useAstronauts>);
    vi.spyOn(astronautsApi, "useUpdateRoles").mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateRoles>);

    render(<RolesPage />, { wrapper });

    fireEvent.click(screen.getByText("Promouvoir admin"));
    fireEvent.click(screen.getByText("Annuler"));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByText(/confirmer/i)).not.toBeInTheDocument();
  });
});

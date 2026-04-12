import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProfileEditPage } from "../ProfileEditPage";
import * as astronautsApi from "@/api/astronauts";
import * as useAuthModule from "@/hooks/useAuth";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/profile/edit"]}>
        <Routes>
          <Route path="/profile/edit" element={<>{children}</>} />
          <Route path="/astronauts/:id" element={<div>Profile Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const mockAstronaut: astronautsApi.ProfileUpdatePayload & { id: number; email: string; first_name: string; last_name: string; photo_url: string | null; roles: string[]; planet_id: number | null; total_points: number } = {
  id: 2,
  email: "user@eleven-labs.com",
  first_name: "Bob",
  last_name: "Martin",
  photo_url: null,
  roles: ["astronaut"],
  planet_id: null,
  total_points: 100,
  hobbies: "coding",
  client: "Acme",
};

describe("ProfileEditPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: { email: "user@eleven-labs.com", astronaut_id: 2, roles: ["astronaut"], planet_id: null },
      isAuthenticated: true,
      isAdmin: false,
      logout: vi.fn(),
    });
  });

  it("affiche le formulaire avec les données existantes", async () => {
    vi.spyOn(astronautsApi, "useAstronaut").mockReturnValue({
      data: mockAstronaut as never,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof astronautsApi.useAstronaut>);
    vi.spyOn(astronautsApi, "useUpdateProfile").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateProfile>);

    render(<ProfileEditPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Modifier mon profil")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/Nom du client/)).toBeInTheDocument();
  });

  it("affiche un spinner pendant le chargement", () => {
    vi.spyOn(astronautsApi, "useAstronaut").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof astronautsApi.useAstronaut>);
    vi.spyOn(astronautsApi, "useUpdateProfile").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateProfile>);

    render(<ProfileEditPage />, { wrapper });

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("appelle mutateAsync avec les valeurs du formulaire à la soumission", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(mockAstronaut);
    vi.spyOn(astronautsApi, "useAstronaut").mockReturnValue({
      data: mockAstronaut as never,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof astronautsApi.useAstronaut>);
    vi.spyOn(astronautsApi, "useUpdateProfile").mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof astronautsApi.useUpdateProfile>);

    render(<ProfileEditPage />, { wrapper });

    await waitFor(() => screen.getByPlaceholderText(/Tes centres d'intérêt/));

    const hobbiesInput = screen.getByPlaceholderText(/Tes centres d'intérêt/);
    fireEvent.change(hobbiesInput, { target: { value: "music" } });

    fireEvent.click(screen.getByText("Enregistrer"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ hobbies: "music" }));
    });
  });

  it("affiche le message d'erreur si la mutation échoue", async () => {
    vi.spyOn(astronautsApi, "useAstronaut").mockReturnValue({
      data: mockAstronaut as never,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof astronautsApi.useAstronaut>);
    vi.spyOn(astronautsApi, "useUpdateProfile").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error("Forbidden"),
    } as unknown as ReturnType<typeof astronautsApi.useUpdateProfile>);

    render(<ProfileEditPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Forbidden")).toBeInTheDocument();
    });
  });
});

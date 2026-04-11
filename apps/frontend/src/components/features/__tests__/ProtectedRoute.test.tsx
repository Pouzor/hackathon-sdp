import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProtectedRoute } from "../ProtectedRoute";
import { AUTH_TOKEN_KEY } from "@/hooks/useAuth";

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function futureExp(): number {
  return Math.floor(Date.now() / 1000) + 3600;
}

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  it("redirects to /login when not authenticated", () => {
    renderWithRouter("/");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders outlet when authenticated with valid token", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: null,
      exp: futureExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    renderWithRouter("/");

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("redirects to /login when token is expired", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: null,
      exp: Math.floor(Date.now() / 1000) - 3600,
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    renderWithRouter("/");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});

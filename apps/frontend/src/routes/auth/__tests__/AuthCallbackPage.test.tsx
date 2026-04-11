import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthCallbackPage } from "../AuthCallbackPage";
import { AUTH_TOKEN_KEY } from "@/hooks/useAuth";

function renderCallback(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  it("stores token and redirects to / when token param is present", () => {
    renderCallback("?token=my.jwt.token");

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("my.jwt.token");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("redirects to /login when no token param", () => {
    renderCallback("");

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});

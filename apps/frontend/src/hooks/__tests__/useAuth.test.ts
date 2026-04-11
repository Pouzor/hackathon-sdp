import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_KEY, useAuth } from "../useAuth";

// Génère un JWT avec le payload donné
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function futureExp(secondsFromNow = 3600): number {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
}

function pastExp(secondsAgo = 3600): number {
  return Math.floor(Date.now() / 1000) - secondsAgo;
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    vi.restoreAllMocks();
  });

  it("returns unauthenticated when no token in localStorage", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns authenticated with valid token", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: 2,
      exp: futureExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("jean@eleven-labs.com");
    expect(result.current.user?.astronaut_id).toBe(1);
    expect(result.current.user?.planet_id).toBe(2);
  });

  it("returns unauthenticated with expired token", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: null,
      exp: pastExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns unauthenticated with malformed token", () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "not-a-jwt");

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("isAdmin is true when roles contains admin", () => {
    const token = makeJwt({
      sub: "1",
      email: "admin@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut", "admin"],
      planet_id: null,
      exp: futureExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(true);
  });

  it("isAdmin is false for regular astronaut", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: null,
      exp: futureExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(false);
  });

  it("logout removes token from localStorage", () => {
    const token = makeJwt({
      sub: "1",
      email: "jean@eleven-labs.com",
      astronaut_id: 1,
      roles: ["astronaut"],
      planet_id: null,
      exp: futureExp(),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    // Stub window.location.href to prevent navigation errors in test
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location);

    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    const { result } = renderHook(() => useAuth());
    result.current.logout();

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();

    locationSpy.mockRestore();
  });
});

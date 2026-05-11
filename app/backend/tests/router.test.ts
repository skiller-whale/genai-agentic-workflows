import { describe, test, expect } from "bun:test";
import { router } from "../src/router";
import type { Route, AppContext } from "../src/router";
import { InMemoryStorage } from "../src/storage";

const makeContext = (): AppContext => ({
  storage: new InMemoryStorage(),
  secretSalt: "test-salt",
});

const makeRequest = (method: string, path: string) =>
  new Request(`http://localhost${path}`, { method });

describe("router()", () => {
  test("returns 404 when no routes match", async () => {
    const fetch = router([], makeContext());
    const res = await fetch(makeRequest("GET", "/missing"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  test("matches a string path", async () => {
    const route: Route = {
      method: "GET",
      path: "/hello",
      async handler() {
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    const res = await fetch(makeRequest("GET", "/hello"));
    expect(res.status).toBe(200);
  });

  test("does not match wrong method on string path", async () => {
    const route: Route = {
      method: "POST",
      path: "/hello",
      async handler() {
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    const res = await fetch(makeRequest("GET", "/hello"));
    expect(res.status).toBe(404);
  });

  test("does not match wrong path", async () => {
    const route: Route = {
      method: "GET",
      path: "/hello",
      async handler() {
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    const res = await fetch(makeRequest("GET", "/world"));
    expect(res.status).toBe(404);
  });

  test("matches a regex path and passes capture groups", async () => {
    let captured: RegExpMatchArray | null = null;
    const route: Route = {
      method: "GET",
      path: /^\/items\/(\d+)$/,
      async handler(_req, _ctx, match) {
        captured = match;
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    await fetch(makeRequest("GET", "/items/42"));
    expect(captured).not.toBeNull();
    expect(captured![1]).toBe("42");
  });

  test("does not match wrong method on regex path", async () => {
    const route: Route = {
      method: "POST",
      path: /^\/items\/(\d+)$/,
      async handler() {
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    const res = await fetch(makeRequest("GET", "/items/42"));
    expect(res.status).toBe(404);
  });

  test("passes context to handler", async () => {
    let receivedContext: AppContext | null = null;
    const route: Route = {
      method: "GET",
      path: "/ctx",
      async handler(_req, ctx) {
        receivedContext = ctx;
        return new Response("ok");
      },
    };
    const context = makeContext();
    const fetch = router([route], context);
    await fetch(makeRequest("GET", "/ctx"));
    expect(receivedContext).toBe(context);
  });

  test("passes null match to string-path handler", async () => {
    let receivedMatch: RegExpMatchArray | null | undefined = undefined;
    const route: Route = {
      method: "GET",
      path: "/exact",
      async handler(_req, _ctx, match) {
        receivedMatch = match;
        return new Response("ok");
      },
    };
    const fetch = router([route], makeContext());
    await fetch(makeRequest("GET", "/exact"));
    expect(receivedMatch).toBeNull();
  });

  test("dispatches to the first matching route", async () => {
    const first: Route = {
      method: "GET",
      path: "/same",
      async handler() {
        return new Response("first");
      },
    };
    const second: Route = {
      method: "GET",
      path: "/same",
      async handler() {
        return new Response("second");
      },
    };
    const fetch = router([first, second], makeContext());
    const res = await fetch(makeRequest("GET", "/same"));
    expect(await res.text()).toBe("first");
  });
});

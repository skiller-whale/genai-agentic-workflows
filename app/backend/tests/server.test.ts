import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE_URL = "http://localhost:4000";

describe("Server API", () => {
  describe("GET /health", () => {
    test("should return status ok", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("POST /hash", () => {
    test("should return hash for valid JSON object", async () => {
      const testData = { name: "test", value: 123 };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(typeof data.hash).toBe("string");
      expect(data.hash).toHaveLength(64);
      expect(data.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should return same hash for same data", async () => {
      const testData = { name: "consistent", value: 42 };

      const response1 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const response2 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.hash).toBe(data2.hash);
    });

    test("should return different hashes for different data", async () => {
      const testData1 = { name: "test1" };
      const testData2 = { name: "test2" };

      const response1 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData1),
      });

      const response2 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData2),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.hash).not.toBe(data2.hash);
    });

    test("should handle complex nested objects", async () => {
      const testData = {
        user: {
          name: "John Doe",
          age: 30,
          address: {
            street: "123 Main St",
            city: "New York",
          },
        },
        metadata: {
          timestamp: "2024-01-01T00:00:00Z",
          tags: ["important", "urgent"],
        },
      };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });

    test("should handle empty objects", async () => {
      const testData = {};

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });

    test("should reject arrays", async () => {
      const testData = [1, 2, 3];

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid request body");
    });

    test("should reject null", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "null",
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject primitives", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '"string value"',
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject invalid JSON", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json{",
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid JSON");
    });

    test("should handle objects with special characters", async () => {
      const testData = {
        text: "Hello 世界! 🌍",
        emoji: "😀🎉",
        special: "!@#$%^&*()",
      };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });
  });

  describe("POST /content", () => {
    test("should return a URL for valid text input", async () => {
      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello, world!" }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("url");
      expect(data.url).toMatch(/^\/content\/[a-f0-9]{64}$/);
    });

    test("should return the same URL for the same text", async () => {
      const body = JSON.stringify({ text: "consistent text" });
      const opts = { method: "POST", headers: { "Content-Type": "application/json" }, body };

      const [r1, r2] = await Promise.all([
        fetch(`${BASE_URL}/content`, opts),
        fetch(`${BASE_URL}/content`, opts),
      ]);

      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

      expect(d1.url).toBe(d2.url);
    });

    test("should return different URLs for different text", async () => {
      const makeRequest = (text: string) =>
        fetch(`${BASE_URL}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

      const [r1, r2] = await Promise.all([makeRequest("foo"), makeRequest("bar")]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

      expect(d1.url).not.toBe(d2.url);
    });

    test("should reject a body missing the text field", async () => {
      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notText: "oops" }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject a non-string text value", async () => {
      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: 42 }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject invalid JSON", async () => {
      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json{",
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject arrays", async () => {
      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(["Hello, world!"]),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("GET /content/:hash", () => {
    test("should return the stored text for a valid hash", async () => {
      const text = "Hello, world!";

      const postResponse = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { url } = await postResponse.json();

      const getResponse = await fetch(`${BASE_URL}${url}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.headers.get("Content-Type")).toMatch(/^text\/plain/);
      expect(await getResponse.text()).toBe(text);
    });

    test("should return 404 for an unknown hash", async () => {
      const response = await fetch(`${BASE_URL}/content/${"0".repeat(64)}`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
    });
  });

  describe("Unknown routes", () => {
    test("should return 404 for unknown GET routes", async () => {
      const response = await fetch(`${BASE_URL}/unknown`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });

    test("should return 404 for unknown POST routes", async () => {
      const response = await fetch(`${BASE_URL}/unknown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });
  });

  describe("Method validation", () => {
    test("should reject GET requests to /hash", async () => {
      const response = await fetch(`${BASE_URL}/hash`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });

    test("should reject POST requests to /health", async () => {
      const response = await fetch(`${BASE_URL}/health`, {
        method: "POST",
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });
  });
});

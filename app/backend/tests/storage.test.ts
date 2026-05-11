import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { InMemoryStorage, FileStorage } from "../src/storage";
import { rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("InMemoryStorage", () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  test("returns undefined for unknown key", async () => {
    expect(await storage.get("missing")).toBeUndefined();
  });

  test("stores and retrieves a value", async () => {
    await storage.set("key", "value");
    expect(await storage.get("key")).toBe("value");
  });

  test("overwrites an existing value", async () => {
    await storage.set("key", "first");
    await storage.set("key", "second");
    expect(await storage.get("key")).toBe("second");
  });

  test("stores multiple keys independently", async () => {
    await storage.set("a", "1");
    await storage.set("b", "2");
    expect(await storage.get("a")).toBe("1");
    expect(await storage.get("b")).toBe("2");
  });

  test("isolates values between instances", async () => {
    const other = new InMemoryStorage();
    await storage.set("key", "value");
    expect(await other.get("key")).toBeUndefined();
  });
});

describe("FileStorage", () => {
  let filePath: string;

  beforeEach(() => {
    filePath = join(tmpdir(), `storage-test-${Date.now()}-${Math.random()}.json`);
  });

  afterEach(async () => {
    await rm(filePath, { force: true });
  });

  test("returns undefined for unknown key", async () => {
    const storage = new FileStorage(filePath);
    await storage.set("other", "value");
    expect(await storage.get("missing")).toBeUndefined();
  });

  test("returns undefined when file does not exist", async () => {
    const storage = new FileStorage(filePath);
    expect(await storage.get("key")).toBeUndefined();
  });

  test("stores and retrieves a value", async () => {
    const storage = new FileStorage(filePath);
    await storage.set("key", "value");
    expect(await storage.get("key")).toBe("value");
  });

  test("persists across instances using the same file", async () => {
    await new FileStorage(filePath).set("key", "value");
    expect(await new FileStorage(filePath).get("key")).toBe("value");
  });

  test("overwrites an existing value", async () => {
    const storage = new FileStorage(filePath);
    await storage.set("key", "first");
    await storage.set("key", "second");
    expect(await storage.get("key")).toBe("second");
  });

  test("stores multiple keys independently", async () => {
    const storage = new FileStorage(filePath);
    await storage.set("a", "1");
    await storage.set("b", "2");
    expect(await storage.get("a")).toBe("1");
    expect(await storage.get("b")).toBe("2");
  });

  test("does not bleed data between different files", async () => {
    const otherPath = filePath + ".other.json";
    try {
      await new FileStorage(filePath).set("key", "value");
      expect(await new FileStorage(otherPath).get("key")).toBeUndefined();
    } finally {
      await rm(otherPath, { force: true });
    }
  });
});

export interface Storage {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

export class InMemoryStorage implements Storage {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | undefined> {
    return this.store.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

export class FileStorage implements Storage {
  constructor(private filePath: string) {}

  async get(key: string): Promise<string | undefined> {
    const data = await this.read();
    return data[key];
  }

  async set(key: string, value: string): Promise<void> {
    const data = await this.read();
    data[key] = value;
    await Bun.write(this.filePath, JSON.stringify(data));
  }

  private async read(): Promise<Record<string, string>> {
    try {
      const text = await Bun.file(this.filePath).text();
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
}

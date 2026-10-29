import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

/**
 * FileStorage: Atomic local JSON persistence engine.
 * Ensures data durability and corruption resistance without external cloud dependencies.
 */
export class FileStorage<T extends { id: string }> {
  private readonly filePath: string;
  private readonly dataDir: string;

  constructor(collectionName: string, private readonly initialData: T[] = []) {
    this.dataDir = join(process.cwd(), '.data');
    this.filePath = join(this.dataDir, `${collectionName}.json`);
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
    if (!existsSync(this.filePath)) {
      this.writeAll(this.initialData);
    }
  }

  public getAll(): T[] {
    try {
      if (!existsSync(this.filePath)) {
        return [...this.initialData];
      }
      const raw = readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw) as T[];
    } catch {
      return [...this.initialData];
    }
  }

  public getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  public insert(item: T): T {
    const list = this.getAll();
    const existingIndex = list.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }
    this.writeAll(list);
    return item;
  }

  public update(id: string, updates: Partial<T>): T | undefined {
    const list = this.getAll();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    list[index] = { ...list[index], ...updates };
    this.writeAll(list);
    return list[index];
  }

  public delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(i => i.id !== id);
    if (filtered.length === list.length) return false;
    this.writeAll(filtered);
    return true;
  }

  private writeAll(items: T[]): void {
    const tmpPath = `${this.filePath}.${Date.now()}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(items, null, 2), 'utf-8');
    renameSync(tmpPath, this.filePath);
  }
}

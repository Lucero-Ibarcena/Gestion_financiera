import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { DatabaseState } from './database.types';

const emptyState: DatabaseState = {
  users: [],
  transactions: [],
  budgets: [],
  goals: [],
};

@Injectable()
export class DatabaseService implements OnModuleInit {
  private state: DatabaseState = structuredClone(emptyState);
  private writeQueue: Promise<void> = Promise.resolve();
  private readonly filePath =
    process.env.DATA_FILE || join(process.cwd(), 'data', 'luma.json');

  async onModuleInit() {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      const contents = await readFile(this.filePath, 'utf8');
      this.state = {
        ...structuredClone(emptyState),
        ...JSON.parse(contents),
      };
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
      await this.persist();
    }
  }

  get data(): DatabaseState {
    return this.state;
  }

  async save() {
    this.writeQueue = this.writeQueue.then(() => this.persist());
    return this.writeQueue;
  }

  private async persist() {
    await mkdir(dirname(this.filePath), { recursive: true });

    const temporaryPath = `${this.filePath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(this.state, null, 2), 'utf8');
    await rename(temporaryPath, this.filePath);
  }
}

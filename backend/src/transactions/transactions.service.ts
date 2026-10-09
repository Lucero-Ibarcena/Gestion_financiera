import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.data.transactions
      .filter((item) => item.userId === userId)
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      );
  }

  async create(userId: string, input: CreateTransactionDto) {
    const entry = {
      ...input,
      description: input.description.trim(),
      category: input.category.trim(),
      id: randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };

    this.db.data.transactions.push(entry);
    await this.db.save();

    return entry;
  }

  async update(userId: string, id: string, input: CreateTransactionDto) {
    const entry = this.db.data.transactions.find(
      (item) => item.id === id && item.userId === userId,
    );

    if (!entry) {
      throw new NotFoundException('No se encontró ese movimiento.');
    }

    Object.assign(entry, input, {
      description: input.description.trim(),
      category: input.category.trim(),
    });
    await this.db.save();

    return entry;
  }

  async remove(userId: string, id: string) {
    const index = this.db.data.transactions.findIndex(
      (item) => item.id === id && item.userId === userId,
    );

    if (index < 0) {
      throw new NotFoundException('No se encontró ese movimiento.');
    }

    this.db.data.transactions.splice(index, 1);
    await this.db.save();

    return { success: true };
  }
}

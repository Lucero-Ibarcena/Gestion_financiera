import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    const budgets = this.db.data.budgets.filter(
      (item) => item.userId === userId,
    );
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return budgets.map((budget) => {
      const spent = this.db.data.transactions
        .filter(
          (item) =>
            item.userId === userId &&
            item.kind === 'expense' &&
            item.category.toLowerCase() === budget.category.toLowerCase() &&
            item.date.slice(0, 7) === month,
        )
        .reduce((total, item) => total + item.amount, 0);

      return { ...budget, spent };
    });
  }

  async create(userId: string, input: CreateBudgetDto) {
    const category = input.category.trim();
    const existing = this.db.data.budgets.find(
      (item) =>
        item.userId === userId &&
        item.category.toLowerCase() === category.toLowerCase(),
    );

    if (existing) {
      existing.limit = input.limit;
      await this.db.save();
      return existing;
    }

    const budget = {
      ...input,
      category,
      id: randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };

    this.db.data.budgets.push(budget);
    await this.db.save();

    return budget;
  }

  async remove(userId: string, id: string) {
    const index = this.db.data.budgets.findIndex(
      (item) => item.id === id && item.userId === userId,
    );

    if (index < 0) {
      throw new NotFoundException('No se encontró ese presupuesto.');
    }

    this.db.data.budgets.splice(index, 1);
    await this.db.save();

    return { success: true };
  }
}

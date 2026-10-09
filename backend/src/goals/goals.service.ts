import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.data.goals.filter((item) => item.userId === userId);
  }

  async create(userId: string, input: CreateGoalDto) {
    const goal = {
      ...input,
      name: input.name.trim(),
      current: Math.min(input.current, input.target),
      id: randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };

    this.db.data.goals.push(goal);
    await this.db.save();

    return goal;
  }

  async contribute(userId: string, id: string, amount: number) {
    const goal = this.db.data.goals.find(
      (item) => item.id === id && item.userId === userId,
    );

    if (!goal) {
      throw new NotFoundException('No se encontró esa meta.');
    }

    goal.current = Math.min(
      goal.target,
      Math.round((goal.current + amount) * 100) / 100,
    );
    await this.db.save();

    return goal;
  }

  async remove(userId: string, id: string) {
    const index = this.db.data.goals.findIndex(
      (item) => item.id === id && item.userId === userId,
    );

    if (index < 0) {
      throw new NotFoundException('No se encontró esa meta.');
    }

    this.db.data.goals.splice(index, 1);
    await this.db.save();

    return { success: true };
  }
}

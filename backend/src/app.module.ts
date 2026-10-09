import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DatabaseService } from './database/database.service';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';
import { BudgetsController } from './budgets/budgets.controller';
import { BudgetsService } from './budgets/budgets.service';
import { GoalsController } from './goals/goals.controller';
import { GoalsService } from './goals/goals.service';
import { HealthController } from './health.controller';
import { AuthGuard } from './common/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'luma-local-dev-secret-change-before-deploy',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    TransactionsController,
    BudgetsController,
    GoalsController,
    HealthController,
  ],
  providers: [
    DatabaseService,
    AuthService,
    AuthGuard,
    TransactionsService,
    BudgetsService,
    GoalsService,
  ],
})
export class AppModule {}

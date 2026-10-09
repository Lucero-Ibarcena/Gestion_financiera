import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AccountUser } from '../database/database.types';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetsService } from './budgets.service';

@Controller('budgets')
@UseGuards(AuthGuard)
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Get()
  list(@CurrentUser() user: Pick<AccountUser, 'id'>) {
    return this.budgets.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Body() input: CreateBudgetDto,
  ) {
    return this.budgets.create(user.id, input);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Param('id') id: string,
  ) {
    return this.budgets.remove(user.id, id);
  }
}

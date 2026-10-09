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
import { ContributeGoalDto } from './dto/contribute-goal.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(AuthGuard)
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  list(@CurrentUser() user: Pick<AccountUser, 'id'>) {
    return this.goals.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Body() input: CreateGoalDto,
  ) {
    return this.goals.create(user.id, input);
  }

  @Post(':id/contributions')
  contribute(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Param('id') id: string,
    @Body() input: ContributeGoalDto,
  ) {
    return this.goals.contribute(user.id, id, input.amount);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Param('id') id: string,
  ) {
    return this.goals.remove(user.id, id);
  }
}

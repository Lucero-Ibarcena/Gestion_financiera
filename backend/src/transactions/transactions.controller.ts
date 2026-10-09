import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AccountUser } from '../database/database.types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: Pick<AccountUser, 'id'>) {
    return this.transactions.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Body() input: CreateTransactionDto,
  ) {
    return this.transactions.create(user.id, input);
  }

  @Put(':id')
  update(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Param('id') id: string,
    @Body() input: CreateTransactionDto,
  ) {
    return this.transactions.update(user.id, id, input);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: Pick<AccountUser, 'id'>,
    @Param('id') id: string,
  ) {
    return this.transactions.remove(user.id, id);
  }
}

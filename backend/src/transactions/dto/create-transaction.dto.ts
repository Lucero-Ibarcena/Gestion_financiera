import { IsIn, IsISO8601, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999)
  amount: number;

  @IsIn(['income', 'expense'])
  kind: 'income' | 'expense';

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  category: string;

  @IsISO8601()
  date: string;
}

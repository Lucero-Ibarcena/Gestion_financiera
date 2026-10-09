import { IsIn, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  category: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(999999999)
  limit: number;

  @IsIn(['month'])
  period: 'month' = 'month';
}

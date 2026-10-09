import { IsNumber, Max, Min } from 'class-validator';

export class ContributeGoalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999)
  amount: number;
}

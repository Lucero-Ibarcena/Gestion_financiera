import { IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(999999999)
  target: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999)
  current: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  dueDate?: string;
}

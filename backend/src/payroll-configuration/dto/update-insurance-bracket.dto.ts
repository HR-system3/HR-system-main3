import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateInsuranceBracketDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerRate?: number;
}


import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTaxRuleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  rate: number;
}


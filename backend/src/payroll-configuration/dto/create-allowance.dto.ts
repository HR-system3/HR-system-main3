import { IsNotEmpty, IsNumber, Min, IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class CreateAllowanceDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(['FIXED', 'VARIABLE'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;
}

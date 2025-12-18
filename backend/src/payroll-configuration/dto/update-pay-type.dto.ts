import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePayTypeDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}


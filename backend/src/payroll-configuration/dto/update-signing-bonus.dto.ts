import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSigningBonusDto {
  @IsOptional()
  @IsString()
  positionName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}


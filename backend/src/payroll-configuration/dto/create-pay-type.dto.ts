import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePayTypeDto {
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(6000, { message: 'Amount must be at least 6000' })
  amount: number;
}


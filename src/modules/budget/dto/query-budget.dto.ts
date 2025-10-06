import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBudgetDto {
  @ApiProperty({
    description: 'Fiscal year (4 digits)',
    example: '2024',
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  year: string;

  @ApiProperty({
    description: 'Budget type',
    enum: ['NEP', 'GAA'],
    example: 'GAA',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['NEP', 'GAA'])
  type: 'NEP' | 'GAA';

  @ApiPropertyOptional({
    description: 'Department code (2 digits)',
    example: '07',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Region code',
    example: '13',
  })
  @IsOptional()
  @IsString()
  region?: string;
}

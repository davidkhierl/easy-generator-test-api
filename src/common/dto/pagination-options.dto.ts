import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationOptions {
  /**
   * Record to skip
   */
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;

  /**
   * Record to take
   */
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  take?: number;
}

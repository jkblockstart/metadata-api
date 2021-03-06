import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class MetadataDTO {
  @IsNumber()
  id: string;

  @IsString()
  nft: string;

  @IsNumber()
  @IsNotEmpty()
  nftId: number;

  @IsArray()
  @Type(() => AttributeDTO)
  attributes: AttributeDTO[];
}

export class AttributeDTO {
  @IsString()
  attribute: string;

  @IsString()
  value: string;
}

export class QueryDTO {
  @IsString()
  nft: string;

  @IsInt()
  @Type(() => Number)
  nftId: number;
}

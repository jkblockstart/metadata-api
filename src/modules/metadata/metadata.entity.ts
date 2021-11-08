import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MetaDataIn } from './metadata.interface';

@Entity()
export class MetaDataEntity extends BaseEntity implements MetaDataIn {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  nft: string;

  @Column()
  nftId: number;

  @Column()
  attribute: string;

  @Column()
  value: string;
}

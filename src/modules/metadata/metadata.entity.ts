import { BaseEntity, Column, Entity, PrimaryColumn, Unique } from 'typeorm'
import { MetaDataInterface } from './metadata.interface'

@Entity()
@Unique('combination_unique', ['nft', 'nftId', 'attribute'])
export class Metadata extends BaseEntity implements MetaDataInterface {
  @PrimaryColumn()
  id: string

  @Column()
  nft: string

  @Column()
  nftId: number

  @Column()
  attribute: string

  @Column()
  value: string

  @Column()
  nftContract: string
}

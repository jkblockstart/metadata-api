import { getManyBy } from '../../helpers'
import { EntityRepository, getConnection, Repository } from 'typeorm'
import { Metadata } from './metadata.entity'
import format from 'pg-format'

export const getMetadatasBy = getManyBy(Metadata)

@EntityRepository(Metadata)
export class MetaDataRepository extends Repository<Metadata> {}

export async function metadataBulkInsert(values: any) {
  const sql = `
    INSERT INTO 
      "metadata" 
      ("id", "nft", "nftId", "attribute", "value") 
    VALUES
      %L`

  const result = await getConnection().query(format(sql, values))
  return result
}

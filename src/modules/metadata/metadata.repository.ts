import { getManyBy } from '../../helpers'
import { EntityRepository, getConnection, Repository } from 'typeorm'
import { Metadata } from './metadata.entity'
import { format } from '@scaleleap/pg-format'

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

export async function fetchDataUsingId(ids: any[], nft: string) {
  const idString = ids.join(',')

  const sql = `
    SELECT 
      "nftId"
    FROM
      "metadata"
    WHERE
      "nftId" IN (${idString}) AND "nft" = $1
  `

  const result = await getConnection().query(sql, [nft])
  return result
}

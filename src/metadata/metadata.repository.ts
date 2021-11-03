import { getManyBy } from '../helpers';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { MetaDataEntity } from './metadata.entity';
// import { format } from 'pg-format';
const format = require('pg-format')

export const getMetaDatabyNftNftId = getManyBy(MetaDataEntity);

@EntityRepository(MetaDataEntity)
export class MetaDataRepository extends Repository<MetaDataEntity> {}
export async function insertMany(table, values) {
  let valuesStr = '';
  for (const value of values) {
    valuesStr = valuesStr.concat(
      `(${value.nft}, ${value.nftId}, ${value.attribute}, ${value.value})`,
    );
  }
  const sql = `
        INSERT
            INTO ${table} (nft, nftId, attribute, value)
            values ${valuesStr}

    `;
  const result = await getConnection().query(sql, []);
  return result;
}

export async function bulkInsert(table, values){
  const sql = `INSERT INTO ${table} (nft, "nftId", attribute, value) VALUES %L`;

  const result = await getConnection().query(format(sql, values));
  return result;
}
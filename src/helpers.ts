/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType, EntitySchema, getRepository } from 'typeorm';

export function getSingleBy<T = any>(
  table: ObjectType<T> | EntitySchema<T>,
): (filter: Partial<T>) => Promise<T> {
  return async (filter) => {
    const record = await getRepository(table).findOne({ where: filter });
    return record;
  };
}

export function getManyBy<T = any>(
  table: ObjectType<T> | EntitySchema<T>,
): (filter: Partial<T>) => Promise<T[]> {
  return async (filter) => {
    const result = await getRepository(table).find({ where: filter });
    return result;
  };
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getMetaDatabyNftNftId,
  insertMany,
  MetaDataRepository,
  bulkInsert,
} from './metadata.repository';
import { QueryIn } from './metadata.interface';
import { MetadataDTO } from './metadata.dto';
import * as path from 'path';
const csv = require('csvtojson');

@Injectable()
export class MetadataService {
  constructor(public readonly metaDataRepository: MetaDataRepository) {}

  createMetaData(metadata: MetadataDTO) {
    const newData = [];
    metadata.attributes.forEach((metaAttr) => {
      newData.push({
        nft: metadata.nft,
        nftId: metadata.nftId,
        attribute: metaAttr.attribute,
        value: metaAttr.value,
      });
    });
    return insertMany('meta_data_entity', newData);
  }
  //add or post
  async addData(metadata: MetadataDTO) {
    const getData = await getMetaDatabyNftNftId({
      nft: metadata.nft,
      nftId: metadata.nftId,
    });
    // Need to modify
    if (getData.length > 0) {
      let duplicateAttribute = false;
      getData.forEach((data) => {
        duplicateAttribute = metadata.attributes.some(
          (attr) => data.attribute === attr.attribute,
        );
      });
      if (duplicateAttribute) {
        return `Same attribute key is present with NFT - ${metadata.nft} and NFTid - ${metadata.nftId}`;
      } else {
        return this.createMetaData(metadata);
      }
    } else {
      return this.createMetaData(metadata);
    }
  }

  //Get data by nft and nftID
  async getFilterData(queryData: QueryIn) {
    let data = await getMetaDatabyNftNftId(queryData);
    const objMeta: MetadataDTO = {
      id: '',
      nft: '',
      nftId: 0,
      attributes: [],
    };
    if (!data) {
      throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
    } else {
      if (data?.length > 0) {
        const attributes = [];
        data = data.map((meta) => {
          objMeta.id = meta.id;
          objMeta.nft = meta.nft;
          objMeta.nftId = meta.nftId;
          if (
            meta.attribute.toLowerCase() === 'name' ||
            meta.attribute.toLowerCase() === 'description' ||
            meta.attribute.toLowerCase() === 'image'
          ) {
            objMeta[meta.attribute] = meta.value;
          } else {
            console.log('meta', meta);
            attributes.push({
              attribute: meta.attribute,
              value: meta.value,
            });
            objMeta.attributes = attributes;
          }
          return meta;
        });
      } else {
        throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
      }
    }
    return objMeta;
  }

  async saveData(metadata: MetadataDTO){
    
    let {nft} = metadata
    let {nftId} = metadata

    delete metadata['nft']
    delete metadata['nftId']

    let allData = [];
    
    metadata.attributes.forEach((data) => {
      let temp = [];
      temp.push(nft);
      temp.push(nftId);
      temp.push(data.attribute);
      temp.push(data.value);

      allData.push(temp);
    })

    await bulkInsert('meta_data_entity', allData);
    return "done"

  }

  async getData(queryData: QueryIn){
    let data = await getMetaDatabyNftNftId(queryData);
    // console.log(data);

    let toReturn = {};
    let toCheck = ['name', 'description', 'image'];
    let attributeData = [];
    data.forEach((item) => {
      toReturn['nft'] = item.nft;
      toReturn['nftId'] = item.nftId;

      if(toCheck.indexOf(item.attribute.toLowerCase()) != -1){
        toReturn[item.attribute] = item.value;
      }else{
        attributeData.push({"attribute": item.attribute, "value": item.value});
      }

    })
    toReturn['attributes'] = attributeData

    return toReturn;

  }

  async processFile(file){
    let filePath = path.join(__dirname, '..', '..', 'files', file.filename);
    
    const jsonArray= await csv().fromFile(filePath);
    let allData = [];
    
    jsonArray.forEach((data) => {
      let {nft} = data
      let {nftId} = data

      delete data['nft']
      delete data['nftId']
      
      Object.keys(data).forEach((elem) => {
        let temp = [];
        temp.push(nft);
        temp.push(nftId);
        temp.push(elem);
        temp.push(data[elem]);

        allData.push(temp)
      })
    })

    await bulkInsert('meta_data_entity', allData);
    return "done"
  }
}

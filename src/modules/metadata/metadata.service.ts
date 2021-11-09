import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import {
  getMetadatasBy,
  MetaDataRepository,
  metadataBulkInsert,
} from './metadata.repository';
import { QueryIn } from './metadata.interface';
import { MetadataDTO } from './metadata.dto';
import * as path from 'path';
const csv = require('csvtojson');
import { uuid } from 'uuidv4';
import { arrayNotEmpty } from 'class-validator';

@Injectable()
export class MetadataService {
  constructor(public readonly metadataRepository: MetaDataRepository) {}

  // async saveData(metadata: MetadataDTO){
  async saveData({nft, nftId, attributes}: MetadataDTO){
    
    try{

      // fetch by nft and nftId
      // check if something is duplicate or not
      let existingMetafields = await getMetadatasBy({"nft": nft, "nftId": nftId});
      let alreadyStored = [];
      let errors = [];
      existingMetafields.forEach((elem) => {
        alreadyStored.push(`${elem.nft}-${elem.nftId}-${elem.attribute}`);
      })

      let allData = [];
      
      attributes.forEach((data) => {
        let tempString = `${nft}-${nftId}-${data.attribute}`;
        if(alreadyStored.indexOf(tempString) != -1){
          errors.push(`Duplicate Entry: ${tempString}`);
        }else{
          let temp = [];
          temp.push(uuid());
          temp.push(nft);
          temp.push(nftId);
          temp.push(data.attribute);
          temp.push(data.value);

          allData.push(temp);
        }

      })

      if(errors.length > 0){
        throw new BadRequestException(JSON.stringify(errors));
      }else{
        await metadataBulkInsert(allData);
        return "Data successfully saved";
      }
      
    } catch(err) {
      throw new BadRequestException(err.message)
    }
    
  }

  async getData(nft: string, nftid: string){
    try {
      let data = await getMetadatasBy({nft: nft, nftId: parseInt(nftid)});
      // console.log(data);
      
      let toReturn = {};
      
      if(data.length > 0){
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

      }

      return toReturn;

    }catch(err) {

    }
    

  }

  async bulkUploadData(file, nft){
    try {

      let filePath = path.join(__dirname, '..', '..', '..', 'files', file.filename);
    
      const jsonArray= await csv().fromFile(filePath);
      let allData = [];

      let alreadynftid = {};
      let errors = [];
      
      jsonArray.forEach((data) => {
        let {nftId} = data

        delete data['nftId']
        
        Object.keys(data).forEach((row) => {

          // check for duplicate entry inside csv file
          if(alreadynftid[nftId] && alreadynftid[nftId].indexOf(row) != -1){
            errors.push(`Duplicate entry issue: ${nftId} - ${row} - ${data[row]}`);
          }else {
            if(alreadynftid[nftId]){
              alreadynftid[nftId].push(row);
            }else{
              alreadynftid[nftId] = [row];
            }
          }
          
          let temp = [];
          temp.push(uuid());
          temp.push(nft);
          temp.push(nftId);
          temp.push(row);
          temp.push(data[row]);

          allData.push(temp)
        })
      })

      if(errors.length > 0){
        throw new BadRequestException(JSON.stringify(errors));
      }

      await metadataBulkInsert(allData);
      return "done"

    } catch(err) {
      throw new BadRequestException(err.message)
    }
    
  }
}

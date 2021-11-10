import { Injectable, BadRequestException } from '@nestjs/common'
import { getMetadatasBy, MetaDataRepository, metadataBulkInsert } from './metadata.repository'
import { MetadataDTO } from './metadata.dto'
import * as path from 'path'
const csv = require('csvtojson')
import { uuid } from 'uuidv4'
import fs from 'fs'
const fsPromises = fs.promises

@Injectable()
export class MetadataService {
  constructor(public readonly metadataRepository: MetaDataRepository) {}

  async saveData({ nft, nftId, attributes }: MetadataDTO) {
    try {
      // fetch by nft and nftId
      // check if something is duplicate or not
      let existingMetafields = await getMetadatasBy({ nft: nft, nftId: nftId })
      let alreadyStoredAttributes = existingMetafields.map((item) => item.attribute)
      let errors = []

      let allData = []

      attributes.forEach((data) => {
        if (alreadyStoredAttributes.indexOf(data.attribute) != -1) {
          errors.push(`Duplicate Entry: ${data.attribute}`)
        } else {
          let dbObject = []
          dbObject.push(uuid())
          dbObject.push(nft)
          dbObject.push(nftId)
          dbObject.push(data.attribute)
          dbObject.push(data.value)

          allData.push(dbObject)
        }
      })

      if (errors.length > 0) {
        throw new BadRequestException(JSON.stringify(errors))
      } else {
        await metadataBulkInsert(allData)
        return 'Data successfully saved'
      }
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async getData(nft: string, nftId: string) {
    try {
      let data = await getMetadatasBy({ nft: nft, nftId: parseInt(nftId) })
      // console.log(data)

      let toReturn = {}

      if (data.length > 0) {
        let toCheck = ['name', 'description', 'image']
        let attributeData = []
        data.forEach((item) => {
          toReturn['nft'] = item.nft
          toReturn['nftId'] = item.nftId

          if (toCheck.indexOf(item.attribute.toLowerCase()) != -1) {
            toReturn[item.attribute] = item.value
          } else {
            attributeData.push({ attribute: item.attribute, value: item.value })
          }
        })
        toReturn['attributes'] = attributeData
      }

      return toReturn
    } catch (err) {
      return {}
    }
  }

  async bulkUploadData(file: any, nft: string) {
    try {
      let filePath = await path.join(__dirname, '..', '..', '..', 'files', file.filename)

      const jsonArray = await csv().fromFile(filePath)
      let allData = []

      let alreadyNftId = {}
      let errors = []

      jsonArray.forEach((data) => {
        let { nftId } = data

        delete data['nftId']

        Object.keys(data).forEach((elem) => {
          // check for duplicate entry inside csv file
          if (alreadyNftId[nftId] && alreadyNftId[nftId].indexOf(elem) != -1) {
            errors.push(`Duplicate entry issue: ${nftId} - ${elem} - ${data[elem]}`)
          } else {
            if (alreadyNftId[nftId]) {
              alreadyNftId[nftId].push(elem)
            } else {
              alreadyNftId[nftId] = [elem]
            }
          }

          let dbObject = []
          dbObject.push(uuid())
          dbObject.push(nft)
          dbObject.push(nftId)
          dbObject.push(elem)
          dbObject.push(data[elem])

          allData.push(dbObject)
        })
      })

      if (errors.length > 0) {
        throw new BadRequestException(JSON.stringify(errors))
      }

      await metadataBulkInsert(allData)
      await fsPromises.unlink(filePath)

      return 'File data successfully saved.'
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }
}

import { Injectable, BadRequestException } from '@nestjs/common'
import { getMetadatasBy, MetaDataRepository, metadataBulkInsert } from './metadata.repository'
import { MetadataDTO } from './metadata.dto'
import * as path from 'path'
const csv = require('csvtojson')
import { uuid } from 'uuidv4'
import * as fs from 'fs'

@Injectable()
export class MetadataService {
  constructor(public readonly metadataRepository: MetaDataRepository) {}

  // async saveData(metadata: MetadataDTO){
  async saveData({ nft, nftId, attributes }: MetadataDTO) {
    try {
      if (nftId < 1) {
        throw new BadRequestException('nftId should be greater than 0')
      }

      // fetch by nft and nftId
      // check if something is duplicate or not
      let dbData = await getMetadatasBy({ nft: nft, nftId: nftId })
      let alreadyStored = []
      let errors = []
      dbData.forEach((elem) => {
        alreadyStored.push(`${elem.nft}-${elem.nftId}-${elem.attribute}`)
      })

      let allData = []

      attributes.forEach((data) => {
        let tempString = `${nft}-${nftId}-${data.attribute}`
        if (alreadyStored.indexOf(tempString) != -1) {
          errors.push(`Duplicate Entry: ${tempString}`)
        } else {
          let temp = []
          temp.push(uuid())
          temp.push(nft)
          temp.push(nftId)
          temp.push(data.attribute)
          temp.push(data.value)

          allData.push(temp)
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
      // console.log(data);

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

        return toReturn
      } else {
        toReturn['nft'] = nft
        toReturn['nftId'] = nftId
        toReturn['attributes'] = []
        return toReturn
      }
    } catch (err) {}
  }

  async bulkUploadData(file, nft) {
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

        let temp = []
        temp.push(uuid())
        temp.push(nft)
        temp.push(nftId)
        temp.push(elem)
        temp.push(data[elem])

        allData.push(temp)
      })
    })

    // return false;

    if (errors.length > 0) {
      throw new BadRequestException(JSON.stringify(errors))
    }

    await metadataBulkInsert(allData)
    await fs.unlink(filePath, (err) => {
      if (err) {
        return 'Could not delete.'
      } else {
        return 'Deleted successfully.'
      }
    })
    return 'done'
  }
}

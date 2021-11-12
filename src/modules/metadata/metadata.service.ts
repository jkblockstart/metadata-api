import { Injectable, BadRequestException } from '@nestjs/common'
import { getMetadatasBy, MetaDataRepository, metadataBulkInsert, fetchDataUsingId } from './metadata.repository'
import { MetadataDTO } from './metadata.dto'
import * as path from 'path'
import * as csv from 'csvtojson'
import { uuid } from 'uuidv4'

// import fs from 'fs'
import { ConfigService } from '@nestjs/config'
// const fsPromises = fs.promises

@Injectable()
export class MetadataService {
  constructor(public readonly metadataRepository: MetaDataRepository, private configService: ConfigService) {}

  async addMetadata({ nft, nftId, attributes }: MetadataDTO, secretKey: string) {
    try {
      if (!secretKey) {
        throw new BadRequestException('Please provide secretkey.')
      }

      if (this.configService.get('SECRET_KEY') != secretKey) {
        throw new BadRequestException('Invalid secretkey.')
      }

      // fetch by nft and nftId
      // check if something is duplicate or not
      const existingMetadata = await getMetadatasBy({ nft, nftId })
      const existingAttributes = existingMetadata.map((item) => item.attribute)
      const errors = []
      const dataToInsert = []
      //TODO: change to for of loop
      //TODO: second check
      for (const data of attributes) {
        if (existingAttributes.indexOf(data.attribute) != -1) {
          errors.push(`Duplicate Entry: ${data.attribute}`)
          continue
        }
        if (!errors.length) {
          const row = []
          row.push(uuid())
          row.push(nft)
          row.push(nftId)
          row.push(data.attribute)
          row.push(data.value)

          existingAttributes.push(data.attribute)
          dataToInsert.push(row)
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(JSON.stringify(errors))
      } else {
        await metadataBulkInsert(dataToInsert)
        return 'Data successfully saved'
      }
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async getMetadata(nft: string, nftId: number) {
    try {
      const metadata = await getMetadatasBy({ nft, nftId })
      // console.log(data)

      const reshapedMetadata: any = {}

      const isAllowed = this.metadataAllow(nft, nftId)
      if (metadata.length > 0 && isAllowed == true) {
        const commonAttributes = ['name', 'description', 'image']
        const attributes = []
        //TODO: replace with for of loop
        for (const item of metadata) {
          if (commonAttributes.indexOf(item.attribute.toLowerCase()) != -1) {
            reshapedMetadata[item.attribute] = item.value
          } else {
            attributes.push({ attribute: item.attribute, value: item.value })
          }
        }

        reshapedMetadata.attributes = attributes
      }

      return reshapedMetadata
    } catch (err) {
      return {}
    }
  }

  async bulkUploadMetadata(file: any, nft: string, secretKey: string) {
    try {
      if (!secretKey) {
        throw new BadRequestException('Please provide secretkey.')
      }

      if (this.configService.get('SECRET_KEY') != secretKey) {
        throw new BadRequestException('Invalid secretkey.')
      }

      const filePath = await path.join(__dirname, '..', '..', '..', 'files', file.filename)

      const metadataArray = await csv().fromFile(filePath)
      const dataToInsert = []

      const errors = []

      //TODO: create an array of all nftId and fetch nftId from table for those nftId if get data return error nft id already exist
      const processedNFTId = []
      for (const row of metadataArray) {
        if (typeof row.nftId != 'number' || row.nftId <= 0) {
          errors.push(`Invalid nftId ${row.nftId}`)
          continue
        }
        if (processedNFTId.indexOf(row.nftId) >= 0) {
          errors.push(`Duplicalte entry for NFT Id ${row.nftId}`)
          continue
        }
        if (!errors.length) {
          processedNFTId.push(row.nftId)
          for (const key in row) {
            const rowToInsert = []
            rowToInsert.push(uuid())
            rowToInsert.push(nft)
            rowToInsert.push(row.nftId)
            rowToInsert.push(key)
            rowToInsert.push(row[key])
            dataToInsert.push(rowToInsert)
          }
        }
      }

      if (errors.length) {
        throw new BadRequestException(JSON.stringify(errors))
      }

      const nftIdData = await fetchDataUsingId(processedNFTId, nft)

      if (nftIdData.length > 0) {
        let errorNftIds = nftIdData.map((item) => item.nftId)
        errorNftIds = [...new Set(errorNftIds)]
        throw new BadRequestException(`${errorNftIds.join(', ')} already present in Database`)
      }

      if (errors.length) {
        throw new BadRequestException(JSON.stringify(errors))
      }

      const existingNFTIds = await fetchDataUsingId(processedNFTId, nft)

      if (existingNFTIds.length > 0) {
        const errorNftIds = existingNFTIds.map((item) => item.nftId)
        throw new BadRequestException(`${errorNftIds.join(', ')} metadata for these NFTId is already added`)
      }
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  metadataAllow(nft: string, nftId: number) {
    return true
  }
}

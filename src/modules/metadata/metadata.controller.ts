import { Body, Controller, Get, Post, UseInterceptors, UploadedFile, Param } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MetadataService } from './metadata.service'
import { MetadataDTO, ContractAdDTO } from './metadata.dto'
import { diskStorage } from 'multer'

@Controller('')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  // add data
  @Post('save/:secretKey')
  addMetadata(@Body() metadata: MetadataDTO, @Param('secretKey') secretKey: string) {
    return this.metadataService.addMetadata(metadata, secretKey)
  }

  @Get('/:nft/:nftId')
  async getMetadata(@Param('nft') nft: string, @Param('nftId') nftId: number) {
    return this.metadataService.getMetadata(nft, nftId)
  }

  @Post('upload/:nft/:secretKey')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
      }),
    })
  )
  async bulkUploadMetadata(@UploadedFile() file, @Param('nft') nft: string, @Param('secretKey') secretKey: string) {
    return this.metadataService.bulkUploadMetadata(file, nft, secretKey)
  }

  // set contract address
  @Post('contractaddress')
  async saveContractAddress(@Body() contractdata: ContractAdDTO) {
    return this.metadataService.addContractAddress(contractdata)
  }
}

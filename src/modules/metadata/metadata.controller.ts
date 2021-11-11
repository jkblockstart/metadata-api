import { Body, Controller, Get, Post, UseInterceptors, UploadedFile, Param } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MetadataService } from './metadata.service'
import { MetadataDTO } from './metadata.dto'
import { diskStorage } from 'multer'

@Controller('')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  // add data
  @Post('save')
  addMetadata(@Body() metadata: MetadataDTO, @Body('secretKey') secretKey: string) {
    return this.metadataService.addMetadata(metadata, secretKey)
  }

  @Get('/:nft/:nftId')
  async getMetadata(@Param('nft') nft: string, @Param('nftId') nftId: number) {
    return this.metadataService.getMetadata(nft, nftId)
  }

  @Post('upload/:nft')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
      }),
    })
  )
  async bulkUploadMetadata(@UploadedFile() file, @Param('nft') nft: string, @Body('secretKey') secretKey: string) {
    return this.metadataService.bulkUploadMetadata(file, nft, secretKey)
  }
}

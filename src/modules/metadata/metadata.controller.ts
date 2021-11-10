import { Body, Controller, Get, Post, UseInterceptors, UploadedFile, Param } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MetadataService } from './metadata.service'
import { MetadataDTO } from './metadata.dto'
import { diskStorage } from 'multer'

@Controller('')
export class MetadataController {
  constructor(private metadataService: MetadataService) { }

  // add data
  @Post('save')
  saveData(@Body() metadata: MetadataDTO) {
    return this.metadataService.saveData(metadata)
  }

  @Get('/:nft/:nftId')
  async getData(@Param('nft') nft, @Param('nftId') nftId) {
    return this.metadataService.getData(nft, nftId)
  }

  @Post('upload/:nft')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
      }),
    })
  )
  async upload(@UploadedFile() file, @Param('nft') nft) {
    return this.metadataService.bulkUploadData(file, nft)
  }
}

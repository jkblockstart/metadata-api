import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MetadataService } from './metadata.service';
import { QueryIn } from './metadata.interface';
import { MetadataDTO } from './metadata.dto';

import { diskStorage } from "multer";
import { extname } from "path";

@Controller('')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  // add data
  @Post('save')
  saveData(@Body() metadata: MetadataDTO){
    return this.metadataService.saveData(metadata);
  }

  @Get('/:nft/:nftid')
  async getData(@Param('nft') nft, @Param('nftid') nftid){
    return this.metadataService.getData(nft, nftid);
  }

  @Post('upload/:nft')
  @UseInterceptors(FileInterceptor("file", {
    storage: diskStorage({
      destination: './files'
    })
  }))
  async upload(@UploadedFile() file, @Param('nft') nft){
    return this.metadataService.bulkUploadData(file, nft);
  }
}

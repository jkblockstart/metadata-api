import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MetadataService } from './metadata.service';
import { QueryIn } from './metadata.interface';
import { MetadataDTO } from './metadata.dto';

import { diskStorage } from "multer";
import { extname } from "path";

@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  /*@Get('nft')
  async getDataByNFT(@Query() queryParams: QueryIn) {
    return this.metadataService.getFilterData(queryParams);
  }

  // register data
  @Post()
  addData(@Body() metaData: MetadataDTO) {
    return this.metadataService.addData(metaData);
  }*/

  // add data
  @Post('save')
  saveData(@Body() metadata: MetadataDTO){
    return this.metadataService.saveData(metadata);
  }

  @Get('nftv1/:nft/:nftId')
  async getData(@Param('nft') nft, @Param('nftId') nftId){
    return this.metadataService.getData(nft, nftId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor("file", {
    storage: diskStorage({
      destination: './files'
    })
  }))
  async upload(@UploadedFile() file){
    return this.metadataService.processFile(file);
  }
}

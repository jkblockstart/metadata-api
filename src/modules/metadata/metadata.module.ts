import { Module } from '@nestjs/common'
import { MetadataService } from './metadata.service'
import { MetadataController } from './metadata.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MetaDataRepository } from './metadata.repository'
import { ConfigModule } from '@nestjs/config'
@Module({
  imports: [TypeOrmModule.forFeature([MetaDataRepository]), ConfigModule],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}

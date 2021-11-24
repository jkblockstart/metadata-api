import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Metadata } from './modules/metadata/metadata.entity'
import { MetadataModule } from './modules/metadata/metadata.module'
import { MulterModule } from '@nestjs/platform-express'

const entities = [Metadata]

@Global()
@Module({
  imports: [
    MetadataModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      synchronize: false,
      autoLoadEntities: true,
      entities: entities,
    }),
    MulterModule.register({
      dest: './files',
    }),
  ],
})
export class AppModule {}

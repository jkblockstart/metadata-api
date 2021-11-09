import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metadata } from './modules/metadata/metadata.entity';
import { MetadataModule } from './modules/metadata/metadata.module';
import { MulterModule } from '@nestjs/platform-express';

const entities = [Metadata];

@Global()
@Module({
  imports: [
    MetadataModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.postgres_host,
      port: parseInt(<string>process.env.postgres_port),
      username: process.env.postgres_user,
      password: process.env.postgres_password,
      database: process.env.postgres_database,
      synchronize: false,
      autoLoadEntities: true,
      entities: entities,
    }),
    MulterModule.register({
      dest: './files',
    })
  ],
})
export class AppModule {}

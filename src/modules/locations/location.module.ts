import { Module } from '@nestjs/common';
import { LocationsController } from './location.controller';
import { LocationsService } from './location.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}

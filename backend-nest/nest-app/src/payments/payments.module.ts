import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectedAccount } from './payments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectedAccount])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

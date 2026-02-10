import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectedAccount } from '../entity/payments.entity';
import { Payment } from 'src/entity/all-transaction-entity';
import { PaymentEvent } from "../entity/payment-events-entity"
import { StripeWebhookController } from 'src/stripe-events/stripe.controller';
import { StripeEventService } from 'src/stripe-events/stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectedAccount, Payment, PaymentEvent])],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [PaymentsService, StripeEventService],
})
export class PaymentsModule { }

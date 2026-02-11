import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEvent } from 'src/entity/payment-events.entity';
import { In, Repository } from 'typeorm';
import Stripe from 'stripe';

@Injectable()
export class StripeEventService {
  constructor(
    @InjectRepository(PaymentEvent)
    private readonly eventRepo: Repository<PaymentEvent>,
  ) { }

  async handleStripeEvent(event: Stripe.Event) {
    console.log("=============== handleStripeEvent called=============== ");
    console.log("Raw Event:", JSON.stringify(event, null, 2));
    const obj: any = event.data.object;
    let type: string | undefined;

    const eventType = event.type as string;
    console.log("==================== > Stripe Event Received ================:", event.type);

    switch (eventType) {

      case 'payment_intent.succeeded':
        type = 'SUCCESS';
        break;

      case 'payment_intent.payment_failed':
        type = 'FAILED';
        break;

      case 'payment_intent.canceled':
        type = 'CANCELED';
        break;

      case 'payment_intent.processing':
        type = 'PROCESSING';
        break;


      case 'charge.succeeded':
        type = 'SUCCESS';
        break;

      case 'charge.failed':
        type = 'FAILED';
        break;

      case 'charge.refunded':
        type = 'REFUNDED';
        break;

      case 'charge.dispute.created':
        type = 'DISPUTE';
        break;

      case 'charge.dispute.closed':
        type = 'DISPUTE_RESOLVED';
        break;

      case 'charge.updated':
        type = 'CHARGE_UPDATED';
        break;


      case 'radar.review.closed':
        if (obj.closed_reason === 'refused') {
          type = 'BLOCKED';
        }
        break;

      case 'radar.early_fraud_warning.created':
        type = 'FRAUD_WARNING';
        break;


      case 'invoice.payment_failed':
        type = 'FAILED';
        break;

      case 'invoice.paid':
        type = 'SUCCESS';
        break;

      default:
        return;
    }

    console.log("=============== Attempting to save Stripe event:==========", event.id);
    const savedEvent = await this.eventRepo.save({
      eventId: event.id,
      eventType: type,
      stripeObjectId: obj.id,
      paymentIntentId: obj.id,
      chargeId: obj.latest_charge ?? null,
      amount: obj.amount ?? null,
      currency: obj.currency ?? null,
      stripeCreatedAt: event.created,
      payload: event,
    });
    console.log("Stripe event stored successfully:", savedEvent.id);
  }

  async getKPIs() {
    const total = await this.eventRepo.count({
      where: { eventType: In(['SUCCESS', 'FAILED']) },
    });

    const success = await this.eventRepo.count({
      where: { eventType: 'SUCCESS' },
    });

    const failed = await this.eventRepo.count({
      where: { eventType: 'FAILED' },
    });

    const blocked = await this.eventRepo.count({
      where: { eventType: 'BLOCKED' },
    });

    const disputes = await this.eventRepo.count({
      where: { eventType: 'DISPUTE' },
    });

    return {
      successRate: total ? (success / total) * 100 : 0,
      failRate: total ? (failed / total) * 100 : 0,
      blockRate: total ? (blocked / total) * 100 : 0,
      disputeRate: total ? (disputes / total) * 100 : 0,
    };
  }
}

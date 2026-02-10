import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEvent } from 'src/entity/payment-events-entity';
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

    const eventType = event.type as string; // ⭐ FIX
    console.log("==================== > Stripe Event Received ================:", event.type);

    switch (eventType) {
      case 'payment_intent.succeeded':
        type = 'SUCCESS';
        break;

      case 'payment_intent.payment_failed':
        type = 'FAILED';
        break;

      case 'charge.dispute.created':
        type = 'DISPUTE';
        break;

      case 'radar.review.closed':
        if (obj.closed_reason === 'refused') {
          type = 'BLOCKED';
        }
        break;

      case 'radar.early_fraud_warning.created':
        type = 'FRAUD_WARNING';
        break;

      default:
        return;
    }

    await this.eventRepo.save({
      eventType: type,
      stripeObjectId: obj.id,
      paymentIntentId: obj.payment_intent ?? null,
      chargeId: obj.charge ?? null,
      stripeCreatedAt: event.created,
    });
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

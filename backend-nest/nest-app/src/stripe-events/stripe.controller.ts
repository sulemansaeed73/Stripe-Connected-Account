import { Controller, Post, Req, Headers, Res } from '@nestjs/common';
import { StripeEventService } from './stripe.service';
import Stripe from 'stripe';
import type { Response } from 'express';

@Controller('stripe')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });

  constructor(private readonly stripeEventService: StripeEventService) { }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.log('Webhook verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await this.stripeEventService.handleStripeEvent(event);

    return res.json({ received: true });
  }
}

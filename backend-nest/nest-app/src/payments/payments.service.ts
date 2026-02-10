import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { ConnectedAccount } from '../entity/payments.entity';
import { Repository } from 'typeorm';
import { Payment } from '../entity/all-transaction-entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(ConnectedAccount)
    private readonly connectedAccountRepo: Repository<ConnectedAccount>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async listConnectedAccounts() {
    const accounts = await this.stripe.accounts.list({ limit: 100 });
    console.log('Accounts', accounts);

    const mappedAccounts = accounts.data.map((acc) => ({
      accountId: acc.id,
      type: acc.type,
      country: acc.country,
      email: acc.email,
      chargesEnabled: acc.charges_enabled,
      payoutsEnabled: acc.payouts_enabled,
      detailsSubmitted: acc.details_submitted,
      stripeCreatedAt: acc.created,
    }));

    for (const account of mappedAccounts) {
      await this.connectedAccountRepo.upsert(account, ['accountId']);
    }

    return this.connectedAccountRepo.find({
      order: { stripeCreatedAt: 'DESC' },
    });
  }

  // Create PaymentIntent and route funds to connected account
  async createPayment(
    amount: number,
    currency: string,
    customerId: string,
    connectedAccountId: string,
    paymentMethodId: string,
  ) {
    console.log('--- createPayment START ---');
    console.log('Input Params:', {
      amount,
      currency,
      customerId,
      connectedAccountId,
      paymentMethodId,
    });

    try {
      console.log('Attaching payment method to customer...');
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      console.log('Payment method attached successfully');

      console.log('Creating PaymentIntent...');
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        payment_method_types: ['card'],
        transfer_data: {
          destination: connectedAccountId,
        },
        description: 'Payment routed to connected account',
      });

      console.log('PaymentIntent created:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });

      console.log('Confirming PaymentIntent...');
      const confirmedPaymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntent.id,
      );

      console.log('PaymentIntent confirmed:', {
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
      });

      console.log('Fetching charges for PaymentIntent...');
      const charges = await this.stripe.charges.list({
        payment_intent: confirmedPaymentIntent.id,
      });

      console.log('Charges fetched:', charges.data.length);

      const mappedCharges = charges.data.map((charge) => {
        const fee =
          typeof charge.balance_transaction === 'object' &&
          charge.balance_transaction
            ? charge.balance_transaction.fee
            : 0;

        console.log('Processing charge:', {
          chargeId: charge.id,
          amount: charge.amount,
          fee,
          paymentMethod: charge.payment_method,
        });

        return {
          chargeId: charge.id,
          amount: charge.amount,
          fee,
          paymentMethod: charge.payment_method,
          receiptUrl: charge.receipt_url,
        };
      });

      const response = {
        paymentIntentId: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
        currency: confirmedPaymentIntent.currency,
        customer: confirmedPaymentIntent.customer,
        connectedAccount: connectedAccountId,
        charges: mappedCharges,
      };

      console.log('Final response payload:', response);
      console.log('--- createPayment SUCCESS ---');

      return response;
    } catch (error) {
      console.error('--- createPayment ERROR ---');
      console.error('Stripe Payment Error:', error);
      throw error;
    }
  }

  // Create a customer
  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      };
    } catch (error) {
      console.error('Stripe Customer Creation Error:', error);
      throw error;
    }
  }
  // List last 50 transactions
  async listPayments(limit = 50) {
    const paymentIntents = await this.stripe.paymentIntents.list({ limit });
    console.log('paymentIntents', paymentIntents);

    const mappedPayments: Partial<Payment>[] = paymentIntents.data.map(
      (pi) => ({
        paymentIntentId: pi.id,

        // REQUIRED FIELD (this fixes the issue)
        accountName: pi.amount === 0 ? 'FR-trial-Acc' : 'FR-recurr-Acc',

        amount: pi.amount ?? 0,
        currency: pi.currency ?? 'usd',
        status: pi.status,
        customer: typeof pi.customer === 'string' ? pi.customer : null,
        connectedAccount:
          typeof pi.transfer_data?.destination === 'string'
            ? pi.transfer_data.destination
            : null,
        stripeCreatedAt: pi.created,
      }),
    );

    await this.paymentRepo.upsert(mappedPayments, ['paymentIntentId']);

    return this.paymentRepo.find({
      order: { stripeCreatedAt: 'DESC' },
      take: limit,
    });
  }
}

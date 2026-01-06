import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { ConnectedAccount } from './payments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(ConnectedAccount)
    private readonly connectedAccountRepo: Repository<ConnectedAccount>,
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
    try {
      // Attach the payment method to the customer
      // The payment method is already created securely on the frontend using Stripe.js
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Create PaymentIntent without confirming first
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

      // Confirm the PaymentIntent with the payment method
      const confirmedPaymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntent.id,
      );

      // Fetch charges separately since PaymentIntent doesn't include charges directly
      const charges = await this.stripe.charges.list({
        payment_intent: confirmedPaymentIntent.id,
      });

      return {
        paymentIntentId: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
        currency: confirmedPaymentIntent.currency,
        customer: confirmedPaymentIntent.customer,
        connectedAccount: connectedAccountId,
        charges: charges.data.map((charge) => ({
          chargeId: charge.id,
          amount: charge.amount,
          fee:
            typeof charge.balance_transaction === 'object' &&
            charge.balance_transaction
              ? charge.balance_transaction.fee
              : 0,
          paymentMethod: charge.payment_method,
          receiptUrl: charge.receipt_url,
        })),
      };
    } catch (error) {
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
    return paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      customer: pi.customer,
      connectedAccount: pi.transfer_data?.destination || null,
      created: pi.created,
    }));
  }
}

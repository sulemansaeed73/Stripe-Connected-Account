import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Route to create customer
  @Post('customer')
  async createCustomer(
    @Body('email') email: string,
    @Body('name') name?: string,
  ) {
    return this.paymentsService.createCustomer(email, name);
  }

  // Route to create payment
  @Post()
  async createPayment(
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('customerId') customerId: string,
    @Body('connectedAccountId') connectedAccountId: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) { 
    return this.paymentsService.createPayment(
      amount,
      currency,
      customerId,
      connectedAccountId,
      paymentMethodId,
    );
  }

  @Get('/connected-accounts')
  async getConnectedAccounts() {
    return this.paymentsService.listConnectedAccounts();
  }

  // Route to list transactions
  @Get()
  async listPayments(@Query('limit') limit?: number) {
    return this.paymentsService.listPayments(limit ? Number(limit) : undefined);
  }
}

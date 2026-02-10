// API utility functions for fetching transaction data

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Transaction {
  id: string;
  accountName: string;
  amount: number;
  currency: string;
  status: string;
  customer: string | null;
  connectedAccount: string | null;
  stripeCreatedAt: number;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
}

export interface CreatePaymentResponse {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
  customer: string;
  connectedAccount: string;
  charges: Array<{
    chargeId: string;
    amount: number;
    fee: number;
    paymentMethod: string;
    receiptUrl: string | null;
  }>;
}

export interface ConnectedAccount {
  id: string;
  accountId: string;
  accountName: string;
  type: string;
  country: string;
  email: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  stripeCreatedAt: number;
  createdAt: Date;
}

export async function fetchTransactions(
  limit?: number
): Promise<Transaction[]> {
  try {
    const url = limit
      ? `${API_BASE_URL}/payments?limit=${limit}`
      : `${API_BASE_URL}/payments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function createCustomer(
  email: string,
  name?: string
): Promise<Customer> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create customer: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

export async function createPayment(
  amount: number,
  currency: string,
  customerId: string,
  connectedAccountId: string,
  paymentMethodId: string
): Promise<CreatePaymentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        customerId,
        connectedAccountId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create payment: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/payments/connected-accounts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch connected accounts: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching connected accounts:", error);
    throw error;
  }
}

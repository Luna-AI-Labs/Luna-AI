/**
 * PaymentService - Handles x402 Payment Required responses
 * and coordinates transactions via Privy/Viem.
 */

import { parseEther, createWalletClient, custom } from 'viem';
import { bifrost } from 'viem/chains';

export interface PaymentInfo {
    address: string;
    amount: string;
    currency: string;
    network?: string;
}

export class PaymentService {
    /**
     * Extracts payment information from a 402 Response
     */
    static getPaymentInfo(response: Response): PaymentInfo | null {
        const address = response.headers.get('X-Payment-Address');
        const amount = response.headers.get('X-Payment-Amount');
        const currency = response.headers.get('X-Payment-Currency');

        if (!address || !amount || !currency) return null;

        return { address, amount, currency };
    }

    /**
     * Executes a payment using the provided wallet
     */
    static async executePayment(wallet: any, paymentInfo: PaymentInfo): Promise<string> {
        try {
            console.log('Initiating payment for AI service...', paymentInfo);

            // If using Privy's connected wallets
            if (wallet.sendTransaction) {
                const txHash = await wallet.sendTransaction({
                    to: paymentInfo.address as `0x${string}`,
                    value: BigInt(paymentInfo.amount), // Amount should be in atomic units (wei-equivalent)
                    // If currency is an ERC20, we would need to handle contract calls here
                    // For now, assuming native token (BFC on Bifrost) or USDC as discussed
                });
                return txHash;
            }

            throw new Error('Wallet does not support sendTransaction');
        } catch (error) {
            console.error('Payment failed:', error);
            throw error;
        }
    }

    /**
     * Wraps a fetch call to automatically handle 402 redirects
     */
    static async secureFetch(url: string, options: RequestInit, wallet: any): Promise<Response> {
        let response = await fetch(url, options);

        if (response.status === 402 && wallet) {
            const paymentInfo = this.getPaymentInfo(response);
            if (paymentInfo) {
                try {
                    const txHash = await this.executePayment(wallet, paymentInfo);

                    // Retry the request with the payment proof
                    const retryOptions = {
                        ...options,
                        headers: {
                            ...options.headers,
                            'X-Payment-Proof': txHash
                        }
                    };

                    return await fetch(url, retryOptions);
                } catch (e) {
                    console.error('Payment flow interrupted');
                    return response; // Return the 402 if payment fails
                }
            }
        }

        return response;
    }
}

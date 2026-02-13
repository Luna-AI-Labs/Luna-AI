/**
 * x402 Middleware - Implements the 402 Payment Required flow
 */

const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || '0xYourWalletAddress';
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT || '10000000000000000'; // 0.01 ETH/BFC in wei
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'NATIVE';

export const x402Middleware = (req, res, next) => {
    // ALLOW BYPASS FOR TESTING
    if (process.env.SKIP_PAYMENT === 'true') {
        return next();
    }

    const paymentProof = req.headers['x-payment-proof'];

    if (!paymentProof) {
        console.log(`[x402] Payment required for ${req.originalUrl}`);

        // Respond with 402 Payment Required
        return res.status(402)
            .set({
                'X-Payment-Address': PAYMENT_ADDRESS,
                'X-Payment-Amount': PAYMENT_AMOUNT,
                'X-Payment-Currency': PAYMENT_CURRENCY,
                'Access-Control-Expose-Headers': 'X-Payment-Address, X-Payment-Amount, X-Payment-Currency'
            })
            .json({
                error: 'Payment Required',
                message: 'This feature requires a small payment to cover AI compute costs.',
                paymentInfo: {
                    address: PAYMENT_ADDRESS,
                    amount: PAYMENT_AMOUNT,
                    currency: PAYMENT_CURRENCY
                }
            });
    }

    // In a real implementation, we would verify the transaction hash (paymentProof)
    // on-chain here using viem/ethers.
    // For the MVP, we assume the proof is valid if present.
    console.log(`[x402] Payment proof received: ${paymentProof}`);
    next();
};

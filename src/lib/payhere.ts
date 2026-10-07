import crypto from "crypto";

/**
 * Generates a hash for PayHere payment processing.
 * @param merchantId - The merchant ID.
 * @param orderId - The order ID.
 * @param amount - The payment amount.
 * @param currency - The currency code.
 * @param merchantSecret - The merchant secret.
 * @returns The generated hash.
 */
//The Function Declaration
export function generatePayHereHash({ params }: {
    params: {
        merchantId: string;
        orderId: string;
        amount: number;
        currency: string;
        merchantSecret: string;
    };
}): string {
    const formattedAmount = params.amount.toFixed(2);

    //Hashing the Secret (First Pass)
    const hashedSecret = crypto
    .createHash("md5")
    .update(params.merchantSecret)
    .digest("hex")
    .toUpperCase();

    const hashString = params.merchantId + params.orderId + formattedAmount + params.currency + hashedSecret;
    
    //Hashing Everything Together (Second Pass)
    return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();

}
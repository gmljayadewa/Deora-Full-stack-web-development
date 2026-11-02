//Card payments (PayHere) on/off. Vercel/.env: NEXT_PUBLIC_CARD_PAYMENTS-ENABLED=true
export const CARD_PAYMENTS_ENABLED =
  process.env.NEXT_PUBLIC_CARD_PAYMENTS_ENABLED === "true";

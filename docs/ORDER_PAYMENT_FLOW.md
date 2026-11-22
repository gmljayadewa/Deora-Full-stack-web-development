# Orders, Payments and Inventory

## Supported checkout methods

`POST /api/orders` maps `COD`, `BANK`, and `WHATSAPP` to `CASH_ON_DELIVERY`, `BANK_TRANSFER`, and `WHATSAPP`. The order API rejects unsupported methods, including `CARD`.

## Stock consistency

`decrementStock()` uses a conditional `updateMany` requiring `quantity >= requested quantity`. The order and stock updates are executed within the same Prisma transaction, preventing partial order creation on a stock failure.

`restoreStock()` increments stock for items supplied to it. In the PayHere notification route, a failed/cancelled pending card order restores stock in a transaction.

## Card-payment lifecycle

```text
POST /api/payment/initiate
  -> feature flag + authentication
  -> validate cart, prices and stock
  -> create pending order/payment; decrement stock
  -> return PayHere initiation details

POST /api/payment/notify
  -> verify merchant, signature, amount, currency
  -> success: confirm order + mark payment paid
  -> failure/cancel: cancel pending order + mark failed + restore stock
  -> duplicate/state conflicts: controlled branches
```

## Known limitations / pre-release review

- A customer abandoning PayHere without a callback may leave stock reserved; implement or verify pending-payment expiry before enabling live card payments.
- Chargebacks are logged for manual review, not fully automated.
- Verify that cancellation of non-card orders correctly restores stock through the admin order-management path.
- Test concurrent checkout and duplicate/out-of-order webhooks using the development database.
- A successful code review does not prove real PayHere webhook delivery.

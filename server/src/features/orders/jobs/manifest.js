import { expireUnpaidCash } from './expire-unpaid-cash.js'

export const job = Object.freeze({ name: 'orders.expire-unpaid-cash', run: expireUnpaidCash })

import { SettingsError, settingsInput, storeName, phone, socialLinks } from './settings-input.js'

function required(row) { if (!row) throw new SettingsError('SETTINGS_UNAVAILABLE'); return row }
function unavailableRead(work) {
  try { return work() } catch { throw new SettingsError('SETTINGS_UNAVAILABLE') }
}
function links(value) { return typeof value === 'string' ? JSON.parse(value) : value }
function fullDto(row) {
  required(row)
  return unavailableRead(() => {
    // Read validation also fails closed on manually corrupted/untrusted persisted values.
    if (!Number.isInteger(row.version) || row.version < 1 || row.version > 4294967295) throw new Error()
    const { storeName: name, storePhone, whatsappPhone, walletEgNumber, instaPayNumber } = row
    return { storeName: storeName(name), storePhone: phone(storePhone, 'storePhone'), whatsappPhone: phone(whatsappPhone, 'whatsappPhone'),
      walletEgNumber: phone(walletEgNumber, 'walletEgNumber'), instaPayNumber: phone(instaPayNumber, 'instaPayNumber'),
      socialLinks: socialLinks(links(row.socialLinks)), version: row.version }
  })
}
function contactDto(row) {
  required(row)
  return unavailableRead(() => ({ storeName: storeName(row.storeName), storePhone: phone(row.storePhone, 'storePhone'),
    whatsappPhone: phone(row.whatsappPhone, 'whatsappPhone') }))
}
export function createSettingsService({ repository }) {
  return Object.freeze({
    async admin() { return fullDto(await repository.full()) },
    async save(input) { return fullDto(await repository.save(settingsInput(input))) },
    async publicContact() {
      const row = required(await repository.contact(true))
      return { ...contactDto(row), socialLinks: unavailableRead(() => socialLinks(links(row.socialLinks))) }
    },
    async contact() { return contactDto(await repository.contact(false)) },
    async payment(method) {
      if (method === 'cash') return { paymentMethod: 'cash', number: null }
      if (!['wallet_eg', 'instapay'].includes(method)) throw new SettingsError('VALIDATION_FAILED', 'paymentMethod')
      const row = required(await repository.payment(method))
      return unavailableRead(() => ({ paymentMethod: method, number: phone(row.number, 'paymentNumber') }))
    },
  })
}

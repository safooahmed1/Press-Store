import { SettingsError } from '../services/settings-input.js'
const contactColumns = 'store_name AS storeName, store_phone AS storePhone, whatsapp_phone AS whatsappPhone'
const fullColumns = `${contactColumns}, wallet_eg_number AS walletEgNumber, insta_pay_number AS instaPayNumber, social_links AS socialLinks, version`

export function createSettingsRepository(database) {
  return Object.freeze({
    async full() { return (await database.query(`SELECT ${fullColumns} FROM store_settings WHERE settings_id = 1`))[0] ?? null },
    async contact(includeSocial = false) {
      return (await database.query(`SELECT ${contactColumns}${includeSocial ? ', social_links AS socialLinks' : ''} FROM store_settings WHERE settings_id = 1`))[0] ?? null
    },
    async payment(method) {
      if (!['wallet_eg', 'instapay'].includes(method)) throw new SettingsError('VALIDATION_FAILED')
      const column = method === 'wallet_eg' ? 'wallet_eg_number' : 'insta_pay_number'
      return (await database.query(`SELECT ${column} AS number FROM store_settings WHERE settings_id = 1`))[0] ?? null
    },
    async save(input) {
      try {
        return await database.transaction(async (tx) => {
          const values = [input.storeName, input.storePhone, input.whatsappPhone, input.walletEgNumber, input.instaPayNumber, JSON.stringify(input.socialLinks)]
          if (input.version === 0) {
            await tx.query(`INSERT INTO store_settings (settings_id, store_name, store_phone, whatsapp_phone,
              wallet_eg_number, insta_pay_number, social_links, version, created_at, updated_at)
              VALUES (1, ?, ?, ?, ?, ?, ?, 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, values)
          } else {
            const result = await tx.query(`UPDATE store_settings SET store_name = ?, store_phone = ?, whatsapp_phone = ?,
              wallet_eg_number = ?, insta_pay_number = ?, social_links = ?, version = version + 1, updated_at = UTC_TIMESTAMP(6)
              WHERE settings_id = 1 AND version = ?`, [...values, input.version])
            if (result.affectedRows !== 1) {
              const [current] = await tx.query('SELECT settings_id FROM store_settings WHERE settings_id = 1')
              throw new SettingsError(current ? 'EDIT_CONFLICT' : 'SETTINGS_UNAVAILABLE')
            }
          }
          return (await tx.query(`SELECT ${fullColumns} FROM store_settings WHERE settings_id = 1`))[0]
        })
      } catch (error) {
        if (input.version === 0 && error.code === 'DB_CONSTRAINT_FAILED') throw new SettingsError('EDIT_CONFLICT')
        throw error
      }
    },
  })
}

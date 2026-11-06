import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { settingsInput, socialLinks } from './settings-input.js'
import { createSettingsService } from './settings.js'

const settings = (extra = {}) => ({ storeName: ' Press Store ', storePhone: '01012345678', whatsappPhone: '01112345678',
  walletEgNumber: '01212345678', instaPayNumber: '01512345678', socialLinks: {}, version: 0, ...extra })

describe('settings approved validation and privacy projections', () => {
  it('normalizes four independent phones and allows both equal and different payment values', () => {
    const normalized = settingsInput(settings())
    assert.equal(normalized.storeName, 'Press Store')
    assert.equal(normalized.walletEgNumber, '+201212345678')
    assert.equal(normalized.instaPayNumber, '+201512345678')
    assert.equal(settingsInput(settings({ instaPayNumber: '01212345678' })).instaPayNumber, normalized.walletEgNumber)
  })
  it('rejects unknown/actor/secret fields, invalid versions, Unicode, phone formatting and bounds', () => {
    for (const extra of [{ actorId: '1' }, { settingsId: 2 }, { password: 'secret' }, { storeName: '\ud800' },
      { storeName: 'x'.repeat(256) }, { storeName: 'a\u0000b' }, { version: -1 }, { version: '1' }, { version: 1.5 },
      { version: 4294967295 }, { storePhone: '+12025551234' }, { walletEgNumber: '010 12345678' }, { instaPayNumber: 'account@instapay' }]) {
      assert.throws(() => settingsInput(settings(extra)), { code: 'VALIDATION_FAILED' })
    }
  })
  it('keeps optional networks empty and permits only corresponding approved HTTPS hosts', () => {
    assert.deepEqual(socialLinks({ facebook: '', instagram: ' ' }), {})
    assert.equal(socialLinks({ instagram: 'https://www.instagram.com/press' }).instagram, 'https://www.instagram.com/press')
    assert.equal(socialLinks({ tiktok: 'https://tiktok.com/@press' }).tiktok, 'https://tiktok.com/@press')
    for (const input of [null, [], { unknown: 'https://facebook.com' }, { facebook: 'javascript:alert(1)' },
      { facebook: 'http://facebook.com/press' }, { facebook: 'https://facebook.com.evil.test/press' },
      { instagram: 'https://facebook.com/press' }, { facebook: 'https://user:pass@facebook.com/press' },
      { facebook: 'https://facebook.com:444/press' }, { facebook: 'x'.repeat(2049) }]) {
      assert.throws(() => socialLinks(input), { code: 'VALIDATION_FAILED' })
    }
  })
  it('projects contact/social without payment or version, even if the repository supplies extra fields', async () => {
    const row = settingsInput(settings({ version: 1 }))
    const service = createSettingsService({ repository: { async contact() { return row } } })
    const publicData = await service.publicContact()
    assert.deepEqual(Object.keys(publicData).sort(), ['socialLinks', 'storeName', 'storePhone', 'whatsappPhone'])
    assert.deepEqual(Object.keys(await service.contact()).sort(), ['storeName', 'storePhone', 'whatsappPhone'])
    assert.doesNotMatch(JSON.stringify(publicData), /wallet|instaPay|version|201212345678|201512345678/)
  })
  it('reads exactly one payment destination, skips DB for cash and ignores unrelated missing data', async () => {
    const calls = []
    const service = createSettingsService({ repository: { async payment(method) {
      calls.push(method)
      return method === 'instapay' ? { number: '+201512345678' } : null
    } } })
    assert.deepEqual(await service.payment('cash'), { paymentMethod: 'cash', number: null })
    assert.deepEqual(calls, [])
    assert.deepEqual(await service.payment('instapay'), { paymentMethod: 'instapay', number: '+201512345678' })
    await assert.rejects(service.payment('wallet_eg'), { code: 'SETTINGS_UNAVAILABLE' })
    await assert.rejects(service.payment('all'), { code: 'VALIDATION_FAILED' })
    assert.deepEqual(calls, ['instapay', 'wallet_eg'])
  })
  it('fails safely when singleton/selected destination or persisted social data is unavailable', async () => {
    const missing = createSettingsService({ repository: { async full() { return null }, async contact() { return null }, async payment() { return { number: '' } } } })
    await assert.rejects(missing.admin(), { code: 'SETTINGS_UNAVAILABLE' })
    await assert.rejects(missing.publicContact(), { code: 'SETTINGS_UNAVAILABLE' })
    await assert.rejects(missing.payment('instapay'), { code: 'SETTINGS_UNAVAILABLE' })
    const corrupted = createSettingsService({ repository: { async contact() { return { ...settings(), socialLinks: { facebook: 'javascript:alert(1)' } } } } })
    await assert.rejects(corrupted.publicContact(), { code: 'SETTINGS_UNAVAILABLE' })
  })
})

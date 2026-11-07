import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { validateRequest, valid, invalid } from '../../../platform/http/validation.js'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { createSettingsService } from '../services/settings.js'
import { createSettingsRepository } from '../repositories/settings.js'
import { SettingsError, settingsInput } from '../services/settings-input.js'

function errors(error, req, res, next) {
  if (!(error instanceof SettingsError)) return next(error)
  const states = { SETTINGS_UNAVAILABLE: [503, 'Store settings are unavailable'], EDIT_CONFLICT: [409, 'Settings changed; reload before saving'],
    VALIDATION_FAILED: [422, 'Settings input is invalid'] }
  const [status, message] = states[error.code] ?? [500, 'An unexpected error occurred']
  next(new HttpError(status, error.code, message))
}
const noQuery = validateRequest('query', (query) => Object.keys(query).length ? invalid({ query: ['Query parameters are not supported'] }) : valid({}))
export function createSettingsRouters({ database, config, appOrigin }) {
  if (!database || typeof database.query !== 'function' || typeof database.transaction !== 'function'
    || !['development', 'test', 'production'].includes(config?.nodeEnv)) throw new Error('Settings runtime context required')
  const service = createSettingsService({ repository: createSettingsRepository(database) })
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production: config.nodeEnv === 'production' })
  const admin = Router()
  admin.use(createAuthGuards({ sessions, cookies }).requireAdmin)
  admin.get('/', noQuery, async (req, res) => sendData(res, { settings: await service.admin() }))
  admin.put('/', mutationBoundary(config.nodeEnv === 'production', appOrigin), requireJson, noQuery,
    validateRequest('body', (body) => {
      try { return valid(settingsInput(body)) } catch (error) {
        if (!(error instanceof SettingsError)) throw error
        return invalid({ [error.field]: ['Invalid setting value'] })
      }
    }), async (req, res) => sendData(res, { settings: await service.save(req.validated.body) }))
  admin.use(errors)
  const publicRouter = Router()
  publicRouter.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  publicRouter.get('/public-contact', noQuery, async (req, res) => sendData(res, await service.publicContact()))
  publicRouter.use(errors)
  return { admin, publicRouter }
}

/** CLI-only protected inputs. No environment file is loaded and no values enter error text. */
export function readAdminBootstrapConfig(env = process.env) {
  const phone = env.BOOTSTRAP_ADMIN_PHONE
  const password = env.BOOTSTRAP_ADMIN_PASSWORD
  if (typeof phone !== 'string' || !phone || typeof password !== 'string' || !password) {
    throw new Error('Invalid admin bootstrap configuration')
  }
  return Object.freeze({ phone, password })
}

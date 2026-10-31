import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Field } from '../../../shared/ui/primitives/index.js'
import { fieldErrors, normalizeEgyptianPhone } from '../api/auth-api.js'

const phoneHint = 'Use 01xxxxxxxxx or +201xxxxxxxxx.'

function firstError(errors) {
  return Object.keys(errors)[0]
}

function clientErrors(values, registration) {
  const errors = {}
  if (registration && !values.firstName.trim()) errors.firstName = 'Enter your first name.'
  if (registration && !values.lastName.trim()) errors.lastName = 'Enter your last name.'
  if (!normalizeEgyptianPhone(values.phone)) errors.phone = 'Enter an Egyptian mobile number.'
  if (!values.password) errors.password = 'Enter your password.'
  return errors
}

export function AuthForm({ registration = false, mutation, onSuccess, admin = false }) {
  const [values, setValues] = useState({ firstName: '', lastName: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  useEffect(() => {
    const field = firstError(errors)
    if (field) document.getElementById(field === 'firstName' ? 'first-name' : field === 'lastName' ? 'last-name' : field)?.focus()
  }, [errors])

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = clientErrors(values, registration)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    const payload = { phone: normalizeEgyptianPhone(values.phone), password: values.password }
    if (registration) Object.assign(payload, { firstName: values.firstName.trim(), lastName: values.lastName.trim() })
    try {
      const data = await mutation.mutateAsync(payload)
      onSuccess(data)
    } catch (error) {
      setErrors(fieldErrors(error))
    }
  }

  const formError = mutation.error && Object.keys(errors).length === 0
    ? mutation.error.code === 'PHONE_UNAVAILABLE' ? 'This phone number is already in use.'
      : mutation.error.code === 'INVALID_CREDENTIALS' ? 'Phone number or password is incorrect.'
        : mutation.error.code === 'RATE_LIMITED' ? 'Too many attempts. Please wait before trying again.'
          : mutation.error.code === 'NETWORK_ERROR' ? 'Unable to reach the service. Try again.'
            : 'We could not complete that request. Try again.'
    : null

  return (
    <form className="grid gap-5" noValidate onSubmit={submit}>
      {formError ? <div className="border-s-4 border-signal-red bg-surface p-4" role="alert">{formError}</div> : null}
      {registration ? <div className="grid gap-5 sm:grid-cols-2">
        <Field id="first-name" name="firstName" label="First name" required value={values.firstName} onChange={update} error={errors.firstName} autoComplete="given-name" />
        <Field id="last-name" name="lastName" label="Last name" required value={values.lastName} onChange={update} error={errors.lastName} autoComplete="family-name" />
      </div> : null}
      <Field id="phone" name="phone" label="Phone number" hint={phoneHint} required value={values.phone} onChange={update} error={errors.phone} inputMode="tel" autoComplete="tel" dir="ltr" />
      <Field id="password" name="password" label="Password" required value={values.password} onChange={update} error={errors.password} type="password" autoComplete={registration ? 'new-password' : 'current-password'} />
      <Button type="submit" pending={mutation.isPending} pendingLabel={registration ? 'Creating account' : 'Signing in'}>{registration ? 'Create account' : 'Sign in'}</Button>
      {!admin && <p className="text-sm text-muted">{registration ? 'Already registered? ' : 'New to Press Store? '}<Link className="font-semibold text-ink underline decoration-signal-red underline-offset-4" to={registration ? '/login' : '/register'}>{registration ? 'Sign in' : 'Create an account'}</Link></p>}
    </form>
  )
}

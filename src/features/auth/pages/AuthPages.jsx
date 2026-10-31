import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/ui/primitives/index.js'
import { AsyncBoundary } from '../../../shared/ui/states/index.js'
import { AuthForm } from '../components/AuthForm.jsx'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { useAdminLogin, useAdminSession, useCustomerLogin, useCustomerLogout, useCustomerRegistration, useCustomerSession, useRedirectWhenSession } from '../hooks/use-auth.js'

export function CustomerLoginPage() {
  const navigate = useNavigate()
  const session = useCustomerSession()
  useRedirectWhenSession(session, '/account', navigate)
  return <AuthLayout title="Welcome back." description="Sign in to pick up where you left off."><AuthForm mutation={useCustomerLogin()} onSuccess={() => navigate('/account', { replace: true })} /></AuthLayout>
}

export function RegisterPage() {
  const navigate = useNavigate()
  const session = useCustomerSession()
  useRedirectWhenSession(session, '/account', navigate)
  return <AuthLayout title="Make it yours." description="Create an account for a smoother pickup order."><AuthForm registration mutation={useCustomerRegistration()} onSuccess={() => navigate('/account', { replace: true })} /></AuthLayout>
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const session = useAdminSession()
  const login = useAdminLogin()
  useRedirectWhenSession(session, '/admin', navigate)
  const blocked = session.error?.code === 'FORBIDDEN'
  return <AuthLayout mode="admin" title="Admin sign in." description="This entrance is reserved for the store operator.">{blocked ? <div className="border-s-4 border-signal-red bg-surface p-4" role="alert">This admin entrance is unavailable to customer accounts.</div> : <AuthForm admin mutation={login} onSuccess={() => navigate('/admin', { replace: true })} />}</AuthLayout>
}

export function AccountPage() {
  const navigate = useNavigate()
  const session = useCustomerSession()
  const logout = useCustomerLogout()
  if (session.isLoading) return <AuthLayout title="Your account." description="Loading your account details."><AsyncBoundary status="loading" /></AuthLayout>
  if (session.error) return <AuthLayout title="Your account." description="Sign in to view your account."><AsyncBoundary status="unauthorized" /><Link className="mt-6 inline-block font-semibold underline decoration-signal-red underline-offset-4" to="/login">Go to sign in</Link></AuthLayout>
  const customer = session.data?.customer ?? session.data
  return <AuthLayout title="Your account." description="Your stored details for Press Store pickup orders.">
    <div className="grid gap-6 border-y border-line py-6">
      <div><p className="text-sm font-semibold text-muted">Name</p><p className="mt-1 text-xl font-semibold">{customer?.firstName} {customer?.lastName}</p></div>
      <div><p className="text-sm font-semibold text-muted">Phone number</p><p className="mt-1 text-xl font-semibold" dir="ltr">{customer?.phone}</p></div>
    </div>
    <Button className="mt-8" variant="quiet" pending={logout.isPending} pendingLabel="Signing out" onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}>Sign out</Button>
  </AuthLayout>
}

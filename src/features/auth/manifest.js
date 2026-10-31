export const feature = {
  id: 'auth',
  routes: [
    { path: '/login', load: () => import('./pages/AuthPages.jsx').then((module) => ({ default: module.CustomerLoginPage })) },
    { path: '/register', load: () => import('./pages/AuthPages.jsx').then((module) => ({ default: module.RegisterPage })) },
    { path: '/account', load: () => import('./pages/AuthPages.jsx').then((module) => ({ default: module.AccountPage })) },
    { path: '/admin/login', load: () => import('./pages/AuthPages.jsx').then((module) => ({ default: module.AdminLoginPage })) },
  ],
}

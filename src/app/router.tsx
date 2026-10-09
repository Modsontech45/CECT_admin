import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'

const LoginPage       = lazy(() => import('@/pages/LoginPage'))
const AdminHomePage   = lazy(() => import('@/pages/AdminHomePage'))
const MembresPage     = lazy(() => import('@/pages/MembresPage'))
const ValidationsPage = lazy(() => import('@/pages/ValidationsPage'))
const FinancePage     = lazy(() => import('@/pages/FinancePage'))
const ConfigPage      = lazy(() => import('@/pages/ConfigurationPage'))
const ExportPage      = lazy(() => import('@/pages/ExportPage'))

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

const router = createBrowserRouter([
  { path: '/connexion', element: <S><LoginPage /></S> },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true,            element: <S><AdminHomePage /></S> },
      { path: 'validations',    element: <S><ValidationsPage /></S> },
      { path: 'membres',        element: <S><MembresPage /></S> },
      { path: 'finance',        element: <S><FinancePage /></S> },
      { path: 'configuration',  element: <S><ConfigPage /></S> },
      { path: 'export',         element: <S><ExportPage /></S> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}

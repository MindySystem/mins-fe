import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import CourtPage from '@/pages/court'
import Dashboard from '@/pages/dashboard'
import ShopPage from '@/pages/shop'

import App from '../App'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'court/*',
        element: <CourtPage />,
      },
      {
        path: 'shop/*',
        element: <ShopPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      }
    ],
  },
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

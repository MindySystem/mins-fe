import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import CourtPage from '@/pages/court'
import Dashboard from '@/pages/dashboard'
import UnauthorizedPage from '@/pages/error/401'
import NotFoundPage from '@/pages/error/404'
import ServerErrorPage from '@/pages/error/500'
import ComingSoonPage from '@/pages/error/coming-soon'
import ServicePage from '@/pages/service'
import ShopPage from '@/pages/shop'
import ShopHomePage from '@/pages/shop/home'
import ProductDetailPage from '@/pages/shop/product-detail'

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
        path: 'shop',
        children: [
          {
            index: true,
            element: <ShopHomePage />,
          },
          {
            path: 'products',
            element: <ShopPage />,
          },
          {
            path: 'products/:productId',
            element: <ProductDetailPage />,
          },
          {
            path: 'sale',
            element: <ComingSoonPage />,
          },
          {
            path: 'news',
            element: <ComingSoonPage />,
          },
          {
            path: 'guide',
            element: <ComingSoonPage />,
          },
          {
            path: 'contact',
            element: <ComingSoonPage />,
          },
        ],
      },
      {
        path: 'court/*',
        element: <CourtPage />,
      },
      {
        path: 'service/*',
        element: <ServicePage />,
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
      },
    ],
  },
  {
    path: '/401',
    element: <UnauthorizedPage />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

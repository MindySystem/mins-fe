import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AdminRoute, ProtectedRoute } from '@/components/route-guards'
import { AuthLayout } from '@/layouts/AuthLayout'
import SessionLayout from '@/layouts/SessionLayout'
import LoginPage from '@/pages/auth/login'
import ProfilePage from '@/pages/auth/profile'
import RegisterPage from '@/pages/auth/register'
import CourtPage from '@/pages/court'
import Dashboard from '@/pages/dashboard'
import UnauthorizedPage from '@/pages/error/401'
import NotFoundPage from '@/pages/error/404'
import ServerErrorPage from '@/pages/error/500'
import ComingSoonPage from '@/pages/error/coming-soon'
import ServicePage from '@/pages/service'
import SessionDetailPage from '@/pages/sessions/detail'
import SessionFormPage from '@/pages/sessions/form'
import SessionsListPage from '@/pages/sessions/list'
import SessionManagePage from '@/pages/sessions/manage'
import MySessionsPage from '@/pages/sessions/my-sessions'
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
    // Badminton session management (admin + user) — yêu cầu đăng nhập
    path: '/',
    element: (
      <ProtectedRoute>
        <SessionLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'sessions', element: <SessionsListPage /> },
      { path: 'sessions/new', element: <AdminRoute><SessionFormPage /></AdminRoute> },
      { path: 'sessions/:id', element: <SessionDetailPage /> },
      {
        path: 'sessions/:id/edit',
        element: (
          <AdminRoute>
            <SessionFormPage />
          </AdminRoute>
        ),
      },
      {
        path: 'sessions/:id/manage',
        element: (
          <AdminRoute>
            <SessionManagePage />
          </AdminRoute>
        ),
      },
      { path: 'my-sessions', element: <MySessionsPage /> },
      { path: 'profile', element: <ProfilePage /> },
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

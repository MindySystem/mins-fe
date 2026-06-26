import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AdminRoute, ProtectedRoute } from '@/components/route-guards'
import { AuthLayout } from '@/layouts/AuthLayout'
import SessionLayout from '@/layouts/SessionLayout'
import ShopMotoLayout from '@/layouts/ShopMotoLayout'
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
import SessionAdminPage from '@/pages/sessions/admin'
import SessionsListPage from '@/pages/sessions/list'
import SessionManagePage from '@/pages/sessions/manage'
import MySessionsPage from '@/pages/sessions/my-sessions'
import PortfolioPage from '@/pages/portfolio'
import ShuttlecocksPage from '@/pages/shuttlecocks'
import ShopPage from '@/pages/shop'
import ShopHomePage from '@/pages/shop/home'
import ProductDetailPage from '@/pages/shop/product-detail'
import ShopMotoAccessoryPage from '@/pages/shop-moto/Accessary'
import ShopMotoCartPage from '@/pages/shop-moto/Cart'
import ShopMotoCatalogAccessoryPage from '@/pages/shop-moto/CatalogAccessory'
import ShopMotoCatalogMotoPage from '@/pages/shop-moto/CatalogMoto'
import ShopMotoMaintenanceHistoryPage from '@/pages/shop-moto/MaintenanceHistory'
import ShopMotoMaintenancePage from '@/pages/shop-moto/Maintenance'
import ShopMotoMyMotoPage from '@/pages/shop-moto/MyMoto'
import ShopMotoMyOrderPage from '@/pages/shop-moto/MyOrder'
import ShopMotoNotFoundPage from '@/pages/shop-moto/NotFound'
import ShopMotoProductPage from '@/pages/shop-moto/Product'
import ShopMotoProfilePage from '@/pages/shop-moto/Profile'
import ShopMotoRescuePage from '@/pages/shop-moto/Rescue'
import ShopMotoVehicleRegistrationHistoryPage from '@/pages/shop-moto/VehicleRegistrationHistory'
import ShopMotoVehicleRegistrationPage from '@/pages/shop-moto/VehicleRegistration'
import ShopMotoPage from '@/pages/shop-moto'
import ShopMotoAdminPage from '@/pages/shop-moto/admin'

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
        path: 'shop-moto',
        element: <ShopMotoLayout />,
        children: [
          {
            index: true,
            element: <ShopMotoPage />,
          },
          {
            path: 'catalog-moto',
            element: <ShopMotoCatalogMotoPage />,
          },
          {
            path: 'catalog-accessory',
            element: <ShopMotoCatalogAccessoryPage />,
          },
          {
            path: 'product/:id',
            element: <ShopMotoProductPage />,
          },
          {
            path: 'accessory/:id',
            element: <ShopMotoAccessoryPage />,
          },
          {
            path: 'cart',
            element: <ShopMotoCartPage />,
          },
          {
            path: 'checkout',
            element: <ShopMotoCartPage />,
          },
          {
            path: 'my-order',
            element: <ShopMotoMyOrderPage />,
          },
          {
            path: 'my-moto',
            element: <ShopMotoMyMotoPage />,
          },
          {
            path: 'maintenance',
            element: <ShopMotoMaintenancePage />,
          },
          {
            path: 'maintenance-history',
            element: <ShopMotoMaintenanceHistoryPage />,
          },
          {
            path: 'vehicle-registration',
            element: <ShopMotoVehicleRegistrationPage />,
          },
          {
            path: 'vehicle-registration-history',
            element: <ShopMotoVehicleRegistrationHistoryPage />,
          },
          {
            path: 'profile',
            element: <ShopMotoProfilePage />,
          },
          {
            path: 'rescue',
            element: <ShopMotoRescuePage />,
          },
          {
            path: '*',
            element: <ShopMotoNotFoundPage />,
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
      {
        path: 'portfolio',
        element: <PortfolioPage />,
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
      { path: 'sessions/admin', element: <AdminRoute><SessionAdminPage /></AdminRoute> },
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
      {
        path: 'shop-moto-admin',
        element: (
          <AdminRoute>
            <ShopMotoAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: 'shop-moto-admin/:section',
        element: (
          <AdminRoute>
            <ShopMotoAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: 'shuttlecocks',
        element: (
          <AdminRoute>
            <ShuttlecocksPage />
          </AdminRoute>
        ),
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

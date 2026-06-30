import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { AccountRoute, AdminRoute, AppAccessRoute, ProtectedRoute, SuperAdminRoute } from '@/components/route-guards'
import { AuthLayout } from '@/layouts/AuthLayout'
import SessionLayout from '@/layouts/SessionLayout'
import ShopMotoLayout from '@/layouts/ShopMotoLayout'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import CourtPage from '@/pages/court'
import Dashboard from '@/pages/dashboard'
import UnauthorizedPage from '@/pages/error/401'
import NotFoundPage from '@/pages/error/404'
import ServerErrorPage from '@/pages/error/500'
import ComingSoonPage from '@/pages/error/coming-soon'
import AdminPortalPage from '@/pages/platform/admin'
import AppDetailPage from '@/pages/platform/app-detail'
import AppStorePage from '@/pages/platform/app-store'
import PlatformCustomerServicesPage from '@/pages/platform/customer-services'
import ModulePage from '@/pages/platform/module'
import PlatformHomePage from '@/pages/platform/home'
import PlatformProfilePage from '@/pages/platform/profile'
import PlatformSetupPage from '@/pages/platform/setup'
import PlatformWelcomePage from '@/pages/platform/welcome'
import PikachuPage from '@/pages/pikachu'
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
        element: <PlatformWelcomePage />,
      },
      {
        path: 'home',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <PlatformHomePage />
            </AccountRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'app-store',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <AppStorePage />
            </AccountRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'app-store/:appCode',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <AppDetailPage />
            </AccountRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PlatformProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'platform/welcome',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'platform/setup',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <PlatformSetupPage />
            </AccountRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'services',
        element: (
          <ProtectedRoute>
            <PlatformCustomerServicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'apps/:appCode',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <ModulePage />
            </AccountRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminPortalPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminPortalPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/workspaces',
        element: (
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminPortalPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/apps',
        element: (
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminPortalPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/subscriptions',
        element: (
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminPortalPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <AccountRoute allow={['business']}>
              <Dashboard />
            </AccountRoute>
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute>
            <AppAccessRoute appCode="motorbike_shop" allowCustomer>
              <ShopMotoLayout />
            </AppAccessRoute>
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute>
            <AppAccessRoute appCode="court_management" allowCustomer>
              <CourtPage />
            </AppAccessRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'service/*',
        element: (
          <ProtectedRoute>
            <AppAccessRoute appCode="court_management">
              <ServicePage />
            </AppAccessRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'portfolio',
        element: <PortfolioPage />,
      },
      {
        path: 'pikachu',
        element: <PikachuPage />,
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
      {
        path: 'sessions',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <SessionsListPage />
          </AppAccessRoute>
        ),
      },
      {
        path: 'sessions/admin',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <AdminRoute>
              <SessionAdminPage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'sessions/new',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <AdminRoute>
              <SessionFormPage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'sessions/:id',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <SessionDetailPage />
          </AppAccessRoute>
        ),
      },
      {
        path: 'sessions/:id/edit',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <AdminRoute>
              <SessionFormPage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'sessions/:id/manage',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <AdminRoute>
              <SessionManagePage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'my-sessions',
        element: (
          <AppAccessRoute appCode="team_badminton">
            <MySessionsPage />
          </AppAccessRoute>
        ),
      },
      {
        path: 'shop-moto-admin',
        element: (
          <AppAccessRoute appCode="motorbike_shop">
            <AdminRoute>
              <ShopMotoAdminPage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'shop-moto-admin/:section',
        element: (
          <AppAccessRoute appCode="motorbike_shop">
            <AdminRoute>
              <ShopMotoAdminPage />
            </AdminRoute>
          </AppAccessRoute>
        ),
      },
      {
        path: 'shuttlecocks',
        element: (
          <AppAccessRoute appCode="court_management">
            <AdminRoute>
              <ShuttlecocksPage />
            </AdminRoute>
          </AppAccessRoute>
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

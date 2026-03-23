import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Dashboard from '@/pages/dashboard'

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
      // {
      //   path: 'court',
      //   element: <CourtPage />,
      // }
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

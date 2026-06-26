import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastContainer } from 'react-toastify'

import '@/features/shop-moto/legacy/axiosSetup'
import '@/features/shop-moto/legacy/index.css'
import 'react-toastify/dist/ReactToastify.css'
import '@/features/shop-moto/legacy/styles/sass/index.scss'
import '@/features/shop-moto/legacy/styles/custom-field.scss'
import '@/features/shop-moto/legacy/styles/global.css'
import '@/features/shop-moto/legacy/styles/home.scss'
import '@/features/shop-moto/legacy/styles/index.scss'
import '@/features/shop-moto/legacy/styles/product.scss'

// @ts-expect-error Web-MoTo components are plain JSX copied from CRA.
import ButtonChat from '@/features/shop-moto/legacy/components/ButtonChat'
// @ts-expect-error Web-MoTo components are plain JSX copied from CRA.
import Footer from '@/features/shop-moto/legacy/components/Footer'
// @ts-expect-error Web-MoTo components are plain JSX copied from CRA.
import Header from '@/features/shop-moto/legacy/components/Header'
// @ts-expect-error Web-MoTo components are plain JSX copied from CRA.
import PopupChatBot from '@/features/shop-moto/legacy/components/PopupChatBot/PopupChatBot'
// @ts-expect-error Web-MoTo Redux store is plain JS copied from CRA.
import store, { persistor } from '@/features/shop-moto/legacy/app/store'

export default function ShopMotoLayout() {
  const [chatStyle, setChatStyle] = useState({ display: 'none' })

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div className="shop-moto-legacy">
          <Header />
          <Outlet />
          <ButtonChat setStyle={setChatStyle} />
          <div style={chatStyle}>
            <PopupChatBot setStyle={setChatStyle} />
          </div>
          <Footer />
          <ToastContainer style={{ fontSize: 15 }} />
        </div>
      </PersistGate>
    </Provider>
  )
}

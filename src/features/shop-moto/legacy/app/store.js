import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from "redux";
import CartSlice from 'stateslice/CartSlice.js'
import UserSlice from 'stateslice/UserSlice.js'
import CheckOutDataSlice from 'stateslice/CheckOutData.js'
import {
  FLUSH,
  PAUSE,
  PERSIST, persistReducer, persistStore, PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist';

const storage = {
  getItem: (key) => Promise.resolve(typeof window === 'undefined' ? null : window.localStorage.getItem(key)),
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }

    return Promise.resolve(value)
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }

    return Promise.resolve()
  },
}

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducers = combineReducers({
  cartList: CartSlice,
  userInfo: UserSlice,
  formData: CheckOutDataSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducers)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
})

export const persistor = persistStore(store);
export default store;

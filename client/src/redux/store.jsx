import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './authSlice';

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Custom storage implementation to avoid ESM import issues with Vite
const customStorage = {
  getItem: (key) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: customStorage,
};

const rootReducer = combineReducers({
  auth: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,'socket/setSocket'],
      },
    }),
});

export default store;
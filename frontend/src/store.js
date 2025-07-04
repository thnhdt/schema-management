import { configureStore } from '@reduxjs/toolkit';
import userReducer from './modules/user/userSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';

const persistConfig = {
  key: 'user',
  storage: storageSession,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  },
});

export const persistor = persistStore(store); 
// src/context/AuthContext.js
// Manages authentication state — token, user info, login/logout

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  isLoading: true,   // true while checking stored token on startup
  isLoggedIn: false,
  token: null,
  user: null,        // { id, name, email, role, inviteCode }
};

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, isLoading: false, isLoggedIn: !!action.token, token: action.token, user: action.user };
    case 'LOGIN':
      return { ...state, isLoading: false, isLoggedIn: true, token: action.token, user: action.user };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, token: null, user: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On app launch: restore saved token and fetch user info
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          const response = await authApi.getMe();
          dispatch({ type: 'RESTORE_TOKEN', token, user: response.data.data });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch {
        // Token invalid or network error — clear and go to login
        await SecureStore.deleteItemAsync('auth_token').catch(() => {});
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const response = await authApi.login({ email, password });
    const { token, user } = response.data.data;
    await SecureStore.setItemAsync('auth_token', token);
    dispatch({ type: 'LOGIN', token, user });
    return user;
  }

  async function register(name, email, password, role) {
    const response = await authApi.register({ name, email, password, role });
    const { token, user } = response.data.data;
    await SecureStore.setItemAsync('auth_token', token);
    dispatch({ type: 'LOGIN', token, user });
    return user;
  }

  async function logout() {
    await SecureStore.deleteItemAsync('auth_token').catch(() => {});
    dispatch({ type: 'LOGOUT' });
  }

  // Update user object in state (e.g. after linking a patient)
  function updateUser(updatedUser) {
    dispatch({ type: 'LOGIN', token: state.token, user: { ...state.user, ...updatedUser } });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

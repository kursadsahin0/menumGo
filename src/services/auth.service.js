import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import {
  mockFetchUser,
  mockForgotPassword,
  mockLogin,
  mockLogout,
  mockRegister,
  mockResetPassword,
} from '@/mocks/auth'

export function login(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.login,
    data: payload,
    mock: () => mockLogin(payload),
  })
}

export function register(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.register,
    data: payload,
    mock: () => mockRegister(payload),
  })
}

export function logout() {
  return request({
    method: 'post',
    url: endpoints.auth.logout,
    mock: () => mockLogout(),
  })
}

export function fetchCurrentUser(token) {
  return request({
    method: 'get',
    url: endpoints.auth.me,
    mock: () => mockFetchUser(token),
  })
}

export function forgotPassword(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.forgotPassword,
    data: payload,
    mock: () => mockForgotPassword(payload),
  })
}

export function resetPassword(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.resetPassword,
    data: payload,
    mock: () => mockResetPassword(payload),
  })
}

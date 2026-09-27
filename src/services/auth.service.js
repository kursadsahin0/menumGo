import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import {
  mockChangePassword,
  mockFetchUser,
  mockForgotPassword,
  mockLogin,
  mockLogout,
  mockRegister,
  mockResetPassword,
  mockUpdateAccount,
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

export function updateAccount(token, payload) {
  return request({
    method: 'patch',
    url: endpoints.auth.me,
    data: payload,
    mock: () => mockUpdateAccount(token, payload),
  })
}

export function changePassword(token, payload) {
  return request({
    method: 'post',
    url: endpoints.auth.password,
    data: payload,
    mock: () => mockChangePassword(token, payload),
  })
}

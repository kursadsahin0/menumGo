import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function login(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.login,
    data: payload,
  })
}

export function register(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.register,
    data: payload,
    timeout: 60000,
  })
}

export function logout() {
  return request({
    method: 'post',
    url: endpoints.auth.logout,
  })
}

export function fetchCurrentUser() {
  return request({
    method: 'get',
    url: endpoints.auth.me,
  })
}

export function forgotPassword(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.forgotPassword,
    data: payload,
    timeout: 60000,
  })
}

export function verifyEmail(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.verifyEmail,
    data: payload,
  })
}

export function sendVerification() {
  return request({
    method: 'post',
    url: endpoints.auth.sendVerification,
  })
}

export function updateSlug(payload) {
  return request({
    method: 'patch',
    url: endpoints.auth.slug,
    data: payload,
  })
}

export function deleteAccount(payload) {
  return request({
    method: 'delete',
    url: endpoints.auth.me,
    data: payload,
  })
}

export function resetPassword(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.resetPassword,
    data: payload,
  })
}

export function updateAccount(payload) {
  return request({
    method: 'patch',
    url: endpoints.auth.me,
    data: payload,
  })
}

export function changePassword(payload) {
  return request({
    method: 'post',
    url: endpoints.auth.password,
    data: payload,
  })
}

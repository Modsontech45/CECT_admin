import { api, ensureCsrf } from '@/lib/api'
import type { LoginResponse, AccessTokenResource, OtpChallengeResource, UserResource } from '@/lib/apiTypes'

export interface LoginPayload {
  identifier: string
  password: string
  device_name?: string
}

export type LoginResult =
  | { type: 'authenticated'; token: AccessTokenResource }
  | { type: 'otp_required'; challenge_id: string; sent_to?: string }

export async function login(payload: LoginPayload): Promise<LoginResult> {
  await ensureCsrf()
  const res = await api.post<LoginResponse>('/auth/login', payload, {
    validateStatus: (s) => s === 200 || s === 202,
  })
  const data = res.data.data as any
  if (data.status === 'otp_required') {
    return { type: 'otp_required', challenge_id: data.challenge_id, sent_to: data.sent_to }
  }
  return { type: 'authenticated', token: data as AccessTokenResource }
}

export async function loginVerifyOtp(challenge_id: string, code: string): Promise<AccessTokenResource> {
  const res = await api.post<{ data: AccessTokenResource }>('/auth/login/verify', { challenge_id, code })
  return res.data.data
}

export async function logout(): Promise<void> {
  try { await api.post('/auth/logout') } catch {}
}

export async function getMe(): Promise<UserResource> {
  const res = await api.get<{ data: UserResource }>('/me')
  return res.data.data
}

export async function resendOtp(challenge_id: string): Promise<OtpChallengeResource> {
  const res = await api.post<{ data: OtpChallengeResource }>('/auth/otp/resend', { challenge_id })
  return res.data.data
}

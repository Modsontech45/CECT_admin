import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe, loginVerifyOtp } from '@/services/authService'
import type { UserResource } from '@/lib/apiTypes'

export type { UserResource }

export type AdminUser = {
  id:     string
  pernum: string | null
  email:  string
  name:   string
  role:   string
  kind:   string
  raw:    UserResource
}

function toAdminUser(u: UserResource): AdminUser {
  return {
    id:     u.id,
    pernum: u.pernum ?? null,
    email:  u.email,
    name:   `${u.first_name} ${u.last_name}`.trim(),
    role:   u.roles?.[0] ?? 'administrateur',
    kind:   u.kind,
    raw:    u,
  }
}

interface OtpChallenge {
  challenge_id: string
  sent_to?:     string
}

interface AuthContextValue {
  user:      AdminUser | null
  loading:   boolean
  login:     (identifier: string, password: string) => Promise<{ ok: boolean; otpRequired?: boolean; challenge?: OtpChallenge }>
  submitOtp: (challenge_id: string, code: string) => Promise<{ ok: boolean }>
  logout:    () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((u) => setUser(toAdminUser(u)))
      .catch(() => { /* no session */ })
      .finally(() => setLoading(false))
  }, [])

  async function login(identifier: string, password: string) {
    const result = await apiLogin({ identifier, password, device_name: 'Admin CECT' })
    if (result.type === 'otp_required') {
      return { ok: true, otpRequired: true, challenge: { challenge_id: result.challenge_id, sent_to: result.sent_to } }
    }
    const u = result.token.user ? toAdminUser(result.token.user) : await getMe().then(toAdminUser)
    setUser(u)
    return { ok: true }
  }

  async function submitOtp(challenge_id: string, code: string) {
    const token = await loginVerifyOtp(challenge_id, code)
    const u = token.user ? toAdminUser(token.user) : await getMe().then(toAdminUser)
    setUser(u)
    return { ok: true }
  }

  async function logout() {
    try { await apiLogout() } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, submitOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

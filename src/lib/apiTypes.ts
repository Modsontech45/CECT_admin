// ── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null }
}

// ── Users / Auth ─────────────────────────────────────────────────────────────

export interface UserResource {
  id: string
  kind: string
  person_type: string | null
  member_number: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string | null
  pernum?: string | null
  roles?: string[]
  permissions?: string[]
  yem_balance?: string
  membership_status?: string | null
  active_families?: string[]
  organization?: {
    id: string
    legal_name: string
    legal_form: string
    rccm: string | null
    nif: string | null
  } | null
  pernums?: { id: string; pernum: string; kind: string; status: string }[]
}

export interface AccessTokenResource {
  status: 'authenticated'
  mode: 'token'
  access_token: string
  token_type: 'Bearer'
  expires_at: string | null
  user: UserResource | null
}

export interface OtpChallengeResource {
  challenge_id: string
  purpose: string
  sent_to: string
  expires_at: string
}

export type LoginResponse =
  | { data: AccessTokenResource }
  | { data: { status: 'otp_required'; challenge_id: string; sent_to?: string; expires_at?: string } }

// ── Admin overview ────────────────────────────────────────────────────────────

export interface AdminOverviewResponse {
  data: {
    members: number
    active_members: number
    total_collected_xof: number
    pending_validations: number
    yem_in_circulation: string
  }
}

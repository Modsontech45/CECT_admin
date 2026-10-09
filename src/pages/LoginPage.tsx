import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Lock, Eye, EyeOff, MailCheck } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { extractApiError } from '@/lib/api'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Champ requis'),
  password:   z.string().min(1, 'Champ requis'),
})
const otpSchema = z.object({ code: z.string().length(6, 'Le code doit contenir 6 chiffres') })

type LoginData = z.infer<typeof loginSchema>
type OtpData   = z.infer<typeof otpSchema>

const inputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

const btnClass =
  'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60 active:scale-[0.99]'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, submitOtp } = useAuth()
  const [showPwd,  setShowPwd]  = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<{ id: string; sentTo?: string } | null>(null)

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const otpForm   = useForm<OtpData>({ resolver: zodResolver(otpSchema) })

  const onLogin = async (data: LoginData) => {
    setApiError(null)
    try {
      const result = await login(data.identifier, data.password)
      if (result.otpRequired && result.challenge) {
        setChallenge({ id: result.challenge.challenge_id, sentTo: result.challenge.sent_to })
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(extractApiError(err).message)
    }
  }

  const onOtp = async (data: OtpData) => {
    if (!challenge) return
    setApiError(null)
    try {
      await submitOtp(challenge.id, data.code)
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(extractApiError(err).message)
    }
  }

  return (
    <>
      <Helmet><title>Connexion Admin — CECT Togo</title></Helmet>
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
              {challenge
                ? <MailCheck size={26} style={{ color: 'var(--color-primary)' }} aria-hidden />
                : <KeyRound  size={26} style={{ color: 'var(--color-primary)' }} aria-hidden />
              }
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-text)' }}>
              {challenge ? 'Vérification par e-mail' : 'Connexion admin'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {challenge?.sentTo
                ? <>Code envoyé à <strong>{challenge.sentTo}</strong></>
                : 'Accès réservé aux membres du staff CECT.'
              }
            </p>
          </div>

          {/* OTP step */}
          {challenge ? (
            <form onSubmit={otpForm.handleSubmit(onOtp)}
              className="space-y-4 p-6 rounded-2xl border shadow-sm"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Code de vérification
                </label>
                <input {...otpForm.register('code')} className={inputClass}
                  placeholder="123456" inputMode="numeric" maxLength={6}
                  autoComplete="one-time-code" autoFocus />
                {otpForm.formState.errors.code && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                    {otpForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              {apiError && <ErrorBanner msg={apiError} />}

              <button type="submit" className={btnClass}
                style={{ background: 'var(--color-primary)' }}
                disabled={otpForm.formState.isSubmitting}>
                <Lock size={16} aria-hidden /> Valider
              </button>
              <button type="button" onClick={() => setChallenge(null)}
                className="w-full text-xs text-center transition-colors"
                style={{ color: 'var(--color-text-muted)' }}>
                ← Retour
              </button>
            </form>
          ) : (
            /* Login step */
            <form onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4 p-6 rounded-2xl border shadow-sm"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Pernum ou e-mail
                </label>
                <input {...loginForm.register('identifier')} className={inputClass}
                  placeholder="Pernum ou e-mail" autoComplete="username" />
                {loginForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                    {loginForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Mot de passe
                </label>
                <div className="relative">
                  <input {...loginForm.register('password')}
                    type={showPwd ? 'text' : 'password'}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label={showPwd ? 'Masquer' : 'Afficher'} tabIndex={-1}>
                    {showPwd ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {apiError && <ErrorBanner msg={apiError} />}

              <button type="submit" className={btnClass}
                style={{ background: 'var(--color-primary)' }}
                disabled={loginForm.formState.isSubmitting}>
                <Lock size={16} aria-hidden /> Se connecter
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-center rounded-xl px-3 py-2 border"
      style={{
        color: 'var(--color-danger)',
        background: 'color-mix(in srgb, var(--color-danger) 5%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-danger) 20%, transparent)',
      }}>
      {msg}
    </p>
  )
}

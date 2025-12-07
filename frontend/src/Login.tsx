import { useMemo, useState, type FormEvent } from 'react'
import styles from './Login.module.css'

const API_BASE_URL = 'http://localhost:8000'

type LoginProps = {
  onBack?: () => void
  onLogin?: () => void
  onCreateAccount?: () => void
}

function Login({ onBack, onLogin, onCreateAccount }: LoginProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const emailIsValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email])
  const passwordIsValid = password.trim().length > 0
  const formIsValid = emailIsValid && passwordIsValid

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!formIsValid) {
      setError('Enter a valid email and password.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Login failed.')
        return
      }

      const userId = data._id ?? data.id
      if (userId) {
        localStorage.setItem('user_id', String(userId))
      }

      onLogin?.()
    } catch {
      setError('Could not connect to backend.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <header className={styles.nav}>
        <div className={`${styles.navBrand} brand`}>&gt; Leeterboard</div>
        <div className={styles.navActions}>
          <button className={styles.ghostButton} type="button" onClick={onBack}>
            back to home
          </button>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.pitch}>
          <p className={styles.kicker}>welcome back</p>
          <h1 className={styles.title}>
            code more <span className={styles.titleAccent}>[log in]</span>
          </h1>
          <p className={styles.copy}>
            Rally your crew and keep your streak alive. Secure entry to view your tournaments and lessons in one place.
          </p>
          <div className={styles.badges}>
            <div className={styles.badge}>secure sessions</div>
            <div className={styles.badge}>team insights</div>
            <div className={styles.badge}>instant sync</div>
          </div>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>sign in</div>
            <div className={styles.cardSub}>unlock your leeterboard dashboard</div>
          </div>

          <label className={styles.inputGroup}>
            <span>email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className={styles.inputGroup}>
            <span>password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <div className={styles.errorText}>{error}</div> : null}

          <button className={styles.primaryButton} type="submit" disabled={submitting || !formIsValid}>
            <span className={styles.arrowText}>&gt;</span> {submitting ? 'working...' : 'log in'}
          </button>

          <div className={styles.footerRow}>
            <span>new to leeterboard?</span>
            <button className={styles.linkButton} type="button" onClick={onCreateAccount}>
              create account
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Login

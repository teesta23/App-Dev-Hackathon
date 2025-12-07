import { useState, type FormEvent } from 'react'
import styles from './Login.module.css'

const API_BASE_URL = 'http://localhost:8000'

type SignupProps = {
  onBack?: () => void
  onCreate?: () => void
  onLogin?: () => void
}

function Signup({ onBack, onCreate, onLogin }: SignupProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEmail = (em: string) => /\S+@\S+\.\S+/.test(em)
  const isUsername = (un: string) => /^[A-Za-z0-9_]{1,30}$/.test(un)
  const passwordsMatch = (password1: string, password2: string) => password1 === password2

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password1 = String(formData.get('password') ?? '').trim()
    const password2 = String(formData.get('re-password') ?? '').trim()

    if (!isUsername(username)) {
      setError('Username must be 1–30 characters and use only letters, numbers, or underscores.')
      return
    }

    if (!isEmail(email)) {
      setError('Use a valid email format (e.g., you@example.com).')
      return
    }

    if (!passwordsMatch(password1, password2)) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password: password1,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Signup failed.')
        return
      }

      const userId = data._id ?? data.id
      if (userId) {
        localStorage.setItem('user_id', String(userId))
      }

      onCreate?.()
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
          <p className={styles.kicker}>welcome to the crew</p>
          <h1 className={styles.title}>
            code more <span className={styles.titleAccent}>[sign up]</span>
          </h1>
          <p className={styles.copy}>
            Build your leeterboard profile, invite teammates, and join tournaments with one shared streak.
          </p>
          <div className={styles.badges}>
            <div className={styles.badge}>tournament-ready</div>
            <div className={styles.badge}>sync rewards</div>
            <div className={styles.badge}>instant access</div>
          </div>
        </section>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>create account</div>
            <div className={styles.cardSub}>spin up your leeterboard identity</div>
          </div>
          <label className={styles.inputGroup}>
            <span>username</span>
            <input
              name="username"
              type="text"
              placeholder="janedoe"
              autoComplete="username"
              title="Usernames cannot contain @"
              required
            />
          </label>
          <label className={styles.inputGroup}>
            <span>email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required />
          </label>
          <label className={styles.inputGroup}>
            <span>password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required />
          </label>
          <label className={styles.inputGroup}>
            <span>re-enter password</span>
            <input
              name="re-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required />
          </label>
          {error ? <div className={styles.errorText}>{error}</div> : null}
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            <span className={styles.arrowText}>&gt;</span> {submitting ? 'working...' : 'create account'}
          </button>
          <div className={styles.footerRow}>
            <span>already have an account?</span>
            <button className={styles.linkButton} type="button" onClick={onLogin}>
              log in
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Signup

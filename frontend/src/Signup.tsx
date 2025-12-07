import { useMemo, useState, type FormEvent } from 'react'
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
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')

  const isEmail = (em: string) => /\S+@\S+\.\S+/.test(em)
  const isUsername = (un: string) => /^[A-Za-z0-9_]{1,30}$/.test(un)
  const passwordsMatch = (password1: string, password2: string) => password1 === password2
  const usernameValid = useMemo(() => isUsername(username.trim()), [username])
  const emailValid = useMemo(() => isEmail(email.trim()), [email])
  const passwordsValid = useMemo(
    () => password1.trim().length > 0 && password2.trim().length > 0 && passwordsMatch(password1, password2),
    [password1, password2],
  )
  const formIsValid = usernameValid && emailValid && passwordsValid

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword1 = password1.trim()
    const trimmedPassword2 = password2.trim()

    if (!isUsername(trimmedUsername)) {
      setError('Username must be 1–30 characters and use only letters, numbers, or underscores.')
      return
    }

    if (!isEmail(trimmedEmail)) {
      setError('Use a valid email format (e.g., you@example.com).')
      return
    }

    if (!passwordsMatch(trimmedPassword1, trimmedPassword2)) {
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
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword1,
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
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required />
          </label>
          <label className={styles.inputGroup}>
            <span>password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password1}
              onChange={(event) => setPassword1(event.target.value)}
              required />
          </label>
          <label className={styles.inputGroup}>
            <span>re-enter password</span>
            <input
              name="re-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password2}
              onChange={(event) => setPassword2(event.target.value)}
              required />
          </label>
          {error ? <div className={styles.errorText}>{error}</div> : null}
          <button className={styles.primaryButton} type="submit" disabled={submitting || !formIsValid}>
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

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
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const usernameError = useMemo(() => {
    const value = username.trim()
    if (!value) return 'Username is required.'
    if (value.length < 3) return 'Username must be at least 3 characters.'
    if (value.length > 30) return 'Username cannot exceed 30 characters.'
    if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Use only letters, numbers, or underscores.'
    return ''
  }, [username])

  const emailError = useMemo(() => {
    const value = email.trim()
    if (!value) return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address.'
    return ''
  }, [email])

  const passwordError = useMemo(() => {
    const value = password1.trim()
    if (!value) return 'Password is required.'
    return ''
  }, [password1])

  const confirmError = useMemo(() => {
    const value = password2.trim()
    if (!value) return 'Please re-enter your password.'
    if (value !== password1.trim()) return 'Passwords must match.'
    return ''
  }, [password1, password2])

  const formIsValid = !usernameError && !emailError && !passwordError && !confirmError

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setUsernameTouched(true)
    setEmailTouched(true)
    setPasswordTouched(true)
    setConfirmTouched(true)

    if (!formIsValid) {
      setError(usernameError || emailError || passwordError || confirmError || 'Fix the highlighted fields.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const trimmedUsername = username.trim()
      const trimmedEmail = email.trim()
      const trimmedPassword1 = password1.trim()

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail.toLowerCase(),
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
              aria-invalid={Boolean(usernameTouched && usernameError)}
              onBlur={() => setUsernameTouched(true)}
              onChange={(event) => setUsername(event.target.value)}
              title="Usernames cannot contain @"
              required
            />
          </label>
          {usernameTouched && usernameError ? <div className={styles.fieldError}>{usernameError}</div> : null}
          <label className={styles.inputGroup}>
            <span>email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(emailTouched && emailError)}
              onBlur={() => setEmailTouched(true)}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {emailTouched && emailError ? <div className={styles.fieldError}>{emailError}</div> : null}
          <label className={styles.inputGroup}>
            <span>password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password1}
              aria-invalid={Boolean(passwordTouched && passwordError)}
              onBlur={() => setPasswordTouched(true)}
              onChange={(event) => setPassword1(event.target.value)}
              required
            />
          </label>
          {passwordTouched && passwordError ? <div className={styles.fieldError}>{passwordError}</div> : null}
          <label className={styles.inputGroup}>
            <span>re-enter password</span>
            <input
              name="re-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password2}
              aria-invalid={Boolean(confirmTouched && confirmError)}
              onBlur={() => setConfirmTouched(true)}
              onChange={(event) => setPassword2(event.target.value)}
              required
            />
          </label>
          {confirmTouched && confirmError ? <div className={styles.fieldError}>{confirmError}</div> : null}
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

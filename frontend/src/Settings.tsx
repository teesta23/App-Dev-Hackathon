import { useEffect, useMemo, useState, type FormEvent } from 'react'
import styles from './Settings.module.css'
import homeStyles from './Home2.module.css'
import { updateUser } from './api/users'
import { getStoredUserId } from './session'

type SettingsProps = {
  onBack?: () => void
  onLogout?: () => void
  onGoToSupport?: () => void
  onGoToTournaments?: () => void
  onGoToLessons?: () => void
  onGoToRoom?: () => void
}

function Settings({ onBack, onLogout, onGoToSupport, onGoToTournaments, onGoToLessons, onGoToRoom }: SettingsProps) {
  const [originalUsername, setOriginalUsername] = useState('User')
  const [originalEmail, setOriginalEmail] = useState('')
  const [username, setUsername] = useState('User')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = localStorage.getItem('user_id')
        if (!userId) return
        const response = await fetch(`http://localhost:8000/users/${userId}`)
        if (response.ok) {
          const user = await response.json()
          setOriginalUsername(user.username || 'User')
          setUsername(user.username || 'User')
          setOriginalEmail(user.email || '')
          setEmail(user.email || '')
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      }
    }
    loadUser()
  }, [])

  const usernameError = useMemo(() => {
    const value = username.trim()
    if (value && value !== originalUsername) {
      if (value.length < 3) return 'Username must be at least 3 characters.'
      if (value.length > 30) return 'Username cannot exceed 30 characters.'
      if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Use only letters, numbers, or underscores.'
    }
    return ''
  }, [username, originalUsername])

  const emailError = useMemo(() => {
    const value = email.trim()
    if (value && value !== originalEmail) {
      if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address.'
    }
    return ''
  }, [email, originalEmail])

  const passwordError = useMemo(() => {
    if (password1.length === 0) return ''
    return ''
  }, [password1])

  const confirmError = useMemo(() => {
    if (!password1 && !password2) return ''
    if (password1 && !password2) return 'Please re-enter your password.'
    if (password1 && password2 && password1 !== password2) return 'Passwords must match.'
    return ''
  }, [password1, password2])

  const hasChanges = username !== originalUsername || email !== originalEmail || password1 !== ''
  const formIsValid = !usernameError && !emailError && !passwordError && !confirmError

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsernameTouched(true)
    setEmailTouched(true)
    setPasswordTouched(true)
    setConfirmTouched(true)

    if (!formIsValid) {
      setError(usernameError || emailError || passwordError || confirmError || 'Please fix the highlighted fields.')
      return
    }

    if (!hasChanges) {
      setError('No changes to save.')
      return
    }

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const userId = getStoredUserId()
      if (!userId) {
        setError('User not logged in.')
        return
      }

      const updates: { username?: string; email?: string; password?: string } = {}
      if (username !== originalUsername) updates.username = username.trim()
      if (email !== originalEmail) updates.email = email.trim().toLowerCase()
      if (password1 !== '') updates.password = password1.trim()

      await updateUser(userId, updates)

      // Update original values after successful save
      setOriginalUsername(username)
      setOriginalEmail(email)
      setPassword1('')
      setPassword2('')
      setPasswordTouched(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderSidebar = () => (
    <aside className={homeStyles.nav}>
      <div className={homeStyles.brand}>&gt; Leeterboard</div>

      <div className={homeStyles.menu}>
        <button className={homeStyles.navItem} type="button" onClick={onBack}>
          <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
          Home
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToLessons?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-bookmark']}`} />
          Learn
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToTournaments?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-calendar']}`} />
          Tournaments
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToRoom?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-user']}`} />
          My Room
        </button>
      </div>

      <div className={homeStyles.footerMenu}>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToSupport?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-chat']}`} />
          support
        </button>
        <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-settings']}`} />
          settings
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onLogout?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-arrow']}`} />
          log out
        </button>
      </div>
    </aside>
  )

  return (
    <div className={styles.page}>
      {renderSidebar()}

      <main className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>profile center</p>
            <h1 className={styles.title}>
              profile <span className={styles.titleAccent}>[settings]</span>
            </h1>
            <p className={styles.subtitle}>
              Update the essentials: your username, your email, or your password.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} type="button" onClick={onBack}>
              back to dashboard
            </button>
            <button className={styles.primaryButton} type="submit" form="settings-form" disabled={submitting || !hasChanges}>
              <span className={styles.arrowText}>&gt;</span> save changes
            </button>
          </div>
        </div>

        <form className={styles.settingsGrid} id="settings-form" onSubmit={handleSave}>
          <section className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>profile basics</div>
                <div className={styles.cardSub}>This is what shows up in tournaments and lessons.</div>
              </div>
            </div>

            <div className={styles.profileStack}>
              {error && <div style={{ color: 'red', marginBottom: '16px', padding: '8px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
              {success && <div style={{ color: 'green', marginBottom: '16px', padding: '8px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>{success}</div>}

              <div className={styles.formGrid}>
                <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>username</span>
                  <input
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    onBlur={() => setUsernameTouched(true)}
                    placeholder="john_smith"
                    disabled={submitting}
                    type="text"
                  />
                  {usernameTouched && usernameError && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '4px' }}>{usernameError}</p>}
                </label>
              </div>
              <div className={styles.formGrid}>
                <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>email</span>
                  <input
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="user@email.com"
                    disabled={submitting}
                    type="email"
                  />
                  {emailTouched && emailError && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '4px' }}>{emailError}</p>}
                </label>
              </div>
              <div className={styles.formGrid}>
                <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>password</span>
                  <input
                    name="password"
                    value={password1}
                    onChange={(event) => setPassword1(event.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="••••••••"
                    disabled={submitting}
                    type="password"
                  />
                  {passwordTouched && passwordError && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '4px' }}>{passwordError}</p>}
                  <p style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>Leave blank to keep current password</p>
                </label>
              </div>
              <div className={styles.formGrid}>
                <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>re-enter password</span>
                  <input
                    name="re-password"
                    value={password2}
                    onChange={(event) => setPassword2(event.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="••••••••"
                    disabled={submitting}
                    type="password"
                  />
                  {confirmTouched && confirmError && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '4px' }}>{confirmError}</p>}
                </label>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button className={styles.primaryButton} type="submit">
                <span className={styles.arrowText}>&gt;</span> save profile
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  )
}

export default Settings

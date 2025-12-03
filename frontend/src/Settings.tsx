import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import styles from './Settings.module.css'
import homeStyles from './Home2.module.css'

type SettingsProps = {
  onBack?: () => void
  onLogout?: () => void
  onGoToSupport?: () => void
}

function Settings({ onBack, onLogout, onGoToSupport }: SettingsProps) {
  const [username, setUsername] = useState('John Smith')
  const [leetcodeHandle, setLeetcodeHandle] = useState('john_smith')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const initials = useMemo(() => {
    const parts = username.trim().split(/\s+/)
    const letters = parts.slice(0, 2).map((part) => part[0]).join('')
    return letters || 'U'
  }, [username])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    }
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const renderSidebar = () => (
    <aside className={homeStyles.nav}>
      <div className={homeStyles.brand}>&gt; Leeterboard</div>

      <div className={homeStyles.menu}>
        <button className={homeStyles.navItem} type="button" onClick={onBack}>
          <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
          Home
        </button>
        <button className={homeStyles.navItem} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-bookmark']}`} />
          Learn
        </button>
        <button className={homeStyles.navItem} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-calendar']}`} />
          Tournaments
        </button>
        <button className={homeStyles.navItem} type="button">
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
            <h1 className={styles.title}>settings</h1>
            <p className={styles.subtitle}>
              Update the essentials: your username, your picture, and the LeetCode account tied to your crew.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} type="button" onClick={onBack}>
              back to dashboard
            </button>
            <button className={styles.primaryButton} type="button">
              <span className={styles.arrowText}>&gt;</span> save changes
            </button>
          </div>
        </div>

        <form className={styles.settingsGrid} onSubmit={handleSave}>
          <section className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>profile basics</div>
                <div className={styles.cardSub}>This is what shows up in tournaments and lessons.</div>
              </div>
            </div>

            <div className={styles.profileStack}>
              <div className={styles.avatarColumn}>
                <div className={styles.avatarShell}>
                  {avatarPreview ? (
                    <img className={styles.avatarImage} src={avatarPreview} alt="Profile preview" />
                  ) : (
                    <div className={styles.avatarInitials}>{initials}</div>
                  )}
                </div>
                <label className={styles.uploadButton}>
                  update photo
                  <input className={styles.fileInput} type="file" accept="image/*" onChange={handleAvatarChange} />
                </label>
                <p className={styles.helper}>JPG or PNG, under 5MB.</p>
              </div>

              <div className={styles.formGrid}>
                <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>username</span>
                  <input
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="John Smith"
                  />
                </label>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <span>linked leetcode</span>
                  <div className={styles.leetcodeRow}>
                    <input
                      name="leetcode"
                      value={leetcodeHandle}
                      onChange={(event) => setLeetcodeHandle(event.target.value)}
                      placeholder="@username"
                    />
                    <button className={styles.primaryButton} type="button">
                      <span className={styles.arrowText}>&gt;</span> sync
                    </button>
                  </div>
                </div>
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

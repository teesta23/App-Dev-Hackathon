import styles from './Home2.module.css'

function Home2() {
  return (
    <div className={styles.page}>
      <aside className={styles.nav}>
        <div className={styles.brand}>&gt; Leeterboard</div>

        <div className={styles.menu}>
          <a className={`${styles.navItem} ${styles.active}`} href="#">
            <span className={`${styles.icon} ${styles['icon-home']}`} />
            Home
          </a>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-bookmark']}`} />
            Learn
          </a>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-calendar']}`} />
            Tournaments
          </a>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-user']}`} />
            My Room
          </a>
        </div>

        <div className={styles.footerMenu}>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-chat']}`} />
            support
          </a>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-settings']}`} />
            settings
          </a>
          <a className={styles.navItem} href="#">
            <span className={`${styles.icon} ${styles['icon-arrow']}`} />
            log out
          </a>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              <span className={`${styles.icon} ${styles['icon-pfp']}`} />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>John Smith</div>
              <div className={styles.joined}>JOINED NOV 28, 2025</div>
            </div>
          </div>

          <div className={styles.pointsCard}>
            <div className={styles.pointsNumber}>2876</div>
            <div className={styles.pointsLabel}>CURRENT POINTS</div>
          </div>
        </div>

        <div className={styles.sectionHeaders}>
          <div className={styles.sectionTitle}>[this week’s tournaments]</div>
          <div className={styles.sectionTitle}>[next lessons]</div>
        </div>

        <div className={styles.mainPanels}>
          <div className={styles.tournamentCard}>
            <div className={styles.tournamentHeader}>example tournament 1</div>

            <div className={styles.tableWrapper}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>#</span>
                <span>PLAYERS</span>
                <span>SOLVED TODAY</span>
                <span>POINTS</span>
              </div>
              <div className={styles.tableBody}>
                <div className={styles.tableRow}>
                  <span>1</span>
                  <span>username</span>
                  <span>10</span>
                  <span>2375</span>
                </div>
                <div className={styles.tableRow}>
                  <span>2</span>
                  <span>username</span>
                  <span>5</span>
                  <span>1032</span>
                </div>
                <div className={`${styles.tableRow} ${styles.highlightRow}`}>
                  <span>3</span>
                  <span>John Smith</span>
                  <span>3</span>
                  <span>972</span>
                </div>
              </div>
            </div>

            <div className={styles.daysLeft}># DAYS LEFT</div>
          </div>

          <div className={styles.lessonsColumn}>
            <div className={styles.lessonCard} />
            <div className={styles.lessonsArrow} />
            <div className={styles.lessonCard} />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton}>
            <span className={`${styles.icon} ${styles['icon-arrow']}`} />
            view all
          </button>
          <button className={styles.primaryButton}>
            <span className={`${styles.icon} ${styles['icon-arrow']}`} />
            all lessons
          </button>
        </div>
      </main>
    </div>
  )
}

export default Home2

import { useMemo, useState } from 'react'
import styles from './Room.module.css' // reuse Room styles for consistency
import homeStyles from './Home2.module.css'

type StoreProps = {
  onBackToDashboard?: () => void
  onLogout?: () => void
}

type StoreItem = {
  id: string
  name: string
  cost: number
  description: string
  owned: boolean
}

const storeItemsList: StoreItem[] = [
  { id: 'mirror', name: 'frameless mirror', cost: 260, description: 'Glow-up lighting for selfies.', owned: false },
  { id: 'speaker', name: 'steam-proof speaker', cost: 220, description: 'Pump lo-fi tunes while grinding.', owned: false },
  { id: 'caddy', name: 'bath caddy', cost: 200, description: 'Holds snacks and strategy notes.', owned: false },
  { id: 'candles', name: 'lavender candles', cost: 160, description: 'For a calm cool-down.', owned: false },
]

export default function Store({ onBackToDashboard, onLogout }: StoreProps) {
  const [points, setPoints] = useState(2876)
  const [items, setItems] = useState<StoreItem[]>(storeItemsList)

  const purchasableItems = useMemo(() => items.filter((item) => !item.owned), [items])
  const ownedItems = useMemo(() => items.filter((item) => item.owned), [items])

  const handlePurchase = (id: string) => {
    const target = items.find((i) => i.id === id)
    if (!target || target.owned || target.cost > points) return

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, owned: true } : i))
    )
    setPoints((prev) => prev - (target.cost ?? 0))
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={homeStyles.nav}>
        <div className={homeStyles.brand}>&gt; Leeterboard</div>

        <div className={homeStyles.menu}>
          <button className={homeStyles.navItem} type="button" onClick={onBackToDashboard}>
            <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
            Home
          </button>
        </div>

        <div className={homeStyles.footerMenu}>
          <button className={homeStyles.navItem} type="button" onClick={onLogout}>
            <span className={`${homeStyles.icon} ${homeStyles['icon-arrow']}`} />
            log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Store</h1>
          <div className={styles.pointsBadge}>
            <div className={styles.pointsNumber}>{points}</div>
            <div className={styles.pointsLabel}>CURRENT POINTS</div>
          </div>
        </div>

        <section className={styles.shopPanel} style={{ display: 'block' }}>
          <div className={styles.shopHeader}>
            <div>
              <div className={styles.shopTitle}>available items</div>
              <div className={styles.shopSub}>spend your points to buy new decor</div>
            </div>
          </div>

          <div className={styles.shopGrid}>
            {purchasableItems.map((item) => (
              <div key={item.id} className={styles.shopCard}>
                <div className={styles.shopName}>{item.name}</div>
                <p className={styles.shopDesc}>{item.description}</p>
                <div className={styles.shopFooter}>
                  <div className={styles.shopCost}>{item.cost} pts</div>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => handlePurchase(item.id)}
                  >
                    <span className={styles.arrowText}>&gt;</span> buy
                  </button>
                </div>
              </div>
            ))}
            {purchasableItems.length === 0 && <div className={styles.shopEmpty}>All items purchased!</div>}
          </div>

          {ownedItems.length > 0 && (
            <div className={styles.inventorySection}>
              <div className={styles.inventoryHeader}>owned items</div>
              <div className={styles.inventoryList}>
                {ownedItems.map((item) => (
                  <div key={item.id} className={styles.inventoryRow}>
                    <div>
                      <div className={styles.inventoryName}>{item.name}</div>
                      <div className={styles.inventoryMeta}>{item.description}</div>
                    </div>
                    <div className={styles.inventoryToggle}>owned</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

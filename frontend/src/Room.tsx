import { useMemo, useState } from 'react'
import homeStyles from './Home2.module.css'
import styles from './Room.module.css'
import showerbot from '../images/showerbot.png'

type RoomProps = {
  onBackToDashboard?: () => void
  onGoToLessons?: () => void
  onGoToTournaments?: () => void
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onLogout?: () => void
}

type RoomItem = {
  id: string
  name: string
  cost: number
  description: string
  vibe: string
  owned: boolean
  placed: boolean
}

const starterItems: RoomItem[] = [
  {
    id: 'rug',
    name: 'sunrise rug',
    cost: 180,
    description: 'warm base so ShowerBot never steps onto cold tile.',
    vibe: 'cozy landing',
    owned: true,
    placed: true,
  },
  {
    id: 'plant',
    name: 'leafy plant',
    cost: 120,
    description: 'keeps the space fresh and hides stray shampoo bottles.',
    vibe: 'fresh air',
    owned: true,
    placed: true,
  },
  {
    id: 'duck',
    name: 'ShowerBot rubber duck',
    cost: 80,
    description: 'personal hype coach floating by the tub.',
    vibe: 'ShowerBot buddy',
    owned: true,
    placed: true,
  },
  {
    id: 'towels',
    name: 'stacked towels',
    cost: 140,
    description: 'so ShowerBot can speed-run drying off.',
    vibe: 'utility',
    owned: true,
    placed: true,
  },
  {
    id: 'mirror',
    name: 'frameless mirror',
    cost: 260,
    description: 'glow-up lighting for post-game selfies.',
    vibe: 'confidence',
    owned: false,
    placed: false,
  },
  {
    id: 'speaker',
    name: 'steam-proof speaker',
    cost: 220,
    description: 'pump lo-fi while decorating or grinding.',
    vibe: 'lo-fi mode',
    owned: false,
    placed: false,
  },
  {
    id: 'caddy',
    name: 'bath caddy',
    cost: 200,
    description: 'holds snacks and strategy notes near the tub.',
    vibe: 'snack ready',
    owned: false,
    placed: false,
  },
  {
    id: 'candles',
    name: 'lavender candles',
    cost: 160,
    description: 'for a calm cool-down after tournaments.',
    vibe: 'chill mode',
    owned: false,
    placed: false,
  },
]

function Room({
  onBackToDashboard,
  onGoToLessons,
  onGoToTournaments,
  onGoToContact,
  onGoToSettings,
  onLogout,
}: RoomProps) {
  const [points, setPoints] = useState(2876)
  const [items, setItems] = useState<RoomItem[]>(starterItems)
  const [showShop, setShowShop] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

  const ownedItems = useMemo(() => items.filter((item) => item.owned), [items])
  const shopItems = useMemo(() => items.filter((item) => !item.owned), [items])
  const placedItems = useMemo(() => ownedItems.filter((item) => item.placed), [ownedItems])
  const stashedItems = useMemo(() => ownedItems.filter((item) => !item.placed), [ownedItems])

  const handlePurchase = (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target || target.owned) return

    if (target.cost > points) return

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owned: true, placed: true } : item)),
    )
    setPoints((prev) => prev - target.cost)
  }

  const togglePlacement = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, placed: !item.placed } : item)),
    )
  }

  const renderSidebar = () => (
    <aside className={homeStyles.nav}>
      <div className={homeStyles.brand}>&gt; Leeterboard</div>

      <div className={homeStyles.menu}>
        <button className={homeStyles.navItem} type="button" onClick={onBackToDashboard}>
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
        <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-user']}`} />
          My Room
        </button>
      </div>

      <div className={homeStyles.footerMenu}>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToContact?.()
          }}
        >
          <span className={`${homeStyles.icon} ${homeStyles['icon-chat']}`} />
          support
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToSettings?.()
          }}
        >
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
          <div>
            <p className={styles.kicker}>bathroom build</p>
            <h1 className={styles.title}>
              decorate ShowerBot&apos;s <span className={styles.titleAccent}>[bathroom]</span>
            </h1>
            <p className={styles.subtitle}>
              Even if you wont shower, ShowerBot still needs to! Use your points to drop furniture and decorate ShowerBot's bathroom.
            </p>
          </div>

          <div className={styles.pointsBadge}>
            <div className={styles.pointsNumber}>{points}</div>
            <div className={styles.pointsLabel}>CURRENT POINTS</div>
          </div>
        </div>

        <section className={styles.sceneCard}>
          <div className={styles.sceneHead}>
            <div>
              <div className={styles.sceneLabel}>ShowerBot bathroom</div>
              <div className={styles.sceneTitle}>room view</div>
              <p className={styles.sceneSub}>
                Toggle items straight in the room. Hit the floating shop to buy new pieces and hit floating inventory to place pieces you already own.
              </p>
            </div>
          </div>

          <div className={styles.roomScene}>
            {!showShop && !showInventory ? (
              <div className={styles.cornerButtons}>
                <button
                  className={styles.cornerButton}
                  type="button"
                  data-label="shop"
                  onClick={() => {
                    setShowShop(true)
                    setShowInventory(false)
                  }}
                  title="open shop"
                >
                  <span className={`${styles.cornerIcon} ${styles.iconShop}`} />
                </button>
                <button
                  className={styles.cornerButton}
                  type="button"
                  data-label="inventory"
                  onClick={() => {
                    setShowInventory(true)
                    setShowShop(false)
                  }}
                  title="open inventory"
                >
                  <span className={`${styles.cornerIcon} ${styles.iconInventory}`} />
                </button>
              </div>
            ) : null}

            <div className={styles.backWall} />
            <div className={styles.stripWall} />
            <div className={styles.floor} />
            <div className={styles.window}>
              <div className={styles.windowCurtain} />
              <div className={styles.windowLight} />
            </div>
            <div className={styles.tub}>
              <div className={styles.tubWater} />
            </div>
            <div className={styles.sink}>
              <div className={styles.faucet} />
            </div>
            <div className={styles.rugShadow} />
            <div className={styles.mascot}>
              <img className={styles.mascotImg} src={showerbot} alt="ShowerBot" />
            </div>

            {placedItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.roomItem} ${styles[item.id]}`}
                type="button"
                onClick={() => togglePlacement(item.id)}
                title={item.placed ? 'Click to stash' : 'Click to place'}
              >
                <span className={styles.itemTag}>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className={`${styles.shopPanel} ${showShop ? styles.shopOpen : ''}`}>
          <div className={styles.shopHeader}>
            <div>
              <div className={styles.shopTitle}>bathroom shop</div>
              <div className={styles.shopSub}>buy decor and manage placement</div>
            </div>
            <button className={styles.ghostButton} type="button" onClick={() => setShowShop(false)}>
              close
            </button>
          </div>

          <div className={styles.shopGrid}>
            {shopItems.map((item) => (
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
          </div>
        </div>

        <div className={`${styles.inventoryPanel} ${showInventory ? styles.shopOpen : ''}`}>
          <div className={styles.shopHeader}>
            <div>
              <div className={styles.shopTitle}>inventory</div>
              <div className={styles.shopSub}>see what’s in room vs. stashed</div>
            </div>
            <button className={styles.ghostButton} type="button" onClick={() => setShowInventory(false)}>
              close
            </button>
          </div>

          <div className={styles.inventorySection}>
            <div className={styles.inventoryHeader}>in room</div>
            <div className={styles.inventoryList}>
              {placedItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.inventoryRow} ${item.placed ? styles.inventoryActive : ''}`}
                  type="button"
                  onClick={() => togglePlacement(item.id)}
                >
                  <div>
                    <div className={styles.inventoryName}>{item.name}</div>
                    <div className={styles.inventoryMeta}>{item.vibe}</div>
                  </div>
                  <div className={styles.inventoryToggle}>placed</div>
                </button>
              ))}
              {placedItems.length === 0 ? <div className={styles.shopEmpty}>Nothing placed yet.</div> : null}
            </div>
          </div>

          <div className={styles.inventorySection}>
            <div className={styles.inventoryHeader}>stashed</div>
            <div className={styles.inventoryList}>
              {stashedItems.map((item) => (
                <button
                  key={item.id}
                  className={styles.inventoryRow}
                  type="button"
                  onClick={() => togglePlacement(item.id)}
                >
                  <div>
                    <div className={styles.inventoryName}>{item.name}</div>
                    <div className={styles.inventoryMeta}>{item.vibe}</div>
                  </div>
                  <div className={styles.inventoryToggle}>stashed</div>
                </button>
              ))}
              {stashedItems.length === 0 ? <div className={styles.shopEmpty}>No items in storage.</div> : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Room

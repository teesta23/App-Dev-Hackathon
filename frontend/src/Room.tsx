import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import homeStyles from './Home2.module.css'
import styles from './Room.module.css'
import showerbot from '../images/showerbot.png'
import bathtubImg from '../images/bathtub.png'
import candleImg from '../images/candle.png'
import dirtyShowerImg from '../images/dirtyshower.png'
import mirrorImg from '../images/mirror.png'
import rubberDuckImg from '../images/rubberduck.png'
import rugImg from '../images/rug.png'
import sinkImg from '../images/sink.png'
import speakerImg from '../images/speaker.png'
import { ApiError, fetchUser, purchaseRoomItem, saveRoomLayout, type RoomItemState } from './api/users'
import { getStoredUserId } from './session'

type RoomProps = {
  onBackToDashboard?: () => void
  onGoToLessons?: () => void
  onGoToTournaments?: () => void
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onLogout?: () => void
}

type CatalogItem = {
  id: string
  name: string
  cost: number
  description: string
  vibe: string
  image: string
  width: number
  defaultX: number
  defaultY: number
  zIndex?: number
  defaultOwned?: boolean
}

type RoomItem = CatalogItem & RoomItemState

const roomCatalog: CatalogItem[] = [
  {
    id: 'dirtyshower',
    name: 'grimy shower stall',
    cost: 0,
    description: 'where we start — cracked tile and mildew galore.',
    vibe: 'baseline',
    image: dirtyShowerImg,
    defaultOwned: true,
    width: 36,
    defaultX: 12,
    defaultY: 56,
    zIndex: 2,
  },
  {
    id: 'bathtub',
    name: 'fresh soak tub',
    cost: 420,
    description: 'new porcelain fix to finally ditch the grime.',
    vibe: 'glow up',
    image: bathtubImg,
    width: 42,
    defaultX: 72,
    defaultY: 62,
    zIndex: 4,
  },
  {
    id: 'sink',
    name: 'floating sink',
    cost: 240,
    description: 'speed-run your hand washing with a clean basin.',
    vibe: 'fresh start',
    image: sinkImg,
    width: 24,
    defaultX: 20,
    defaultY: 62,
    zIndex: 5,
  },
  {
    id: 'rug',
    name: 'sunrise rug',
    cost: 180,
    description: 'warm base so ShowerBot never steps onto cold tile.',
    vibe: 'cozy landing',
    image: rugImg,
    width: 48,
    defaultX: 50,
    defaultY: 86,
    zIndex: 1,
  },
  {
    id: 'mirror',
    name: 'frameless mirror',
    cost: 260,
    description: 'glow-up lighting for post-game selfies.',
    vibe: 'confidence',
    image: mirrorImg,
    width: 24,
    defaultX: 18,
    defaultY: 20,
    zIndex: 3,
  },
  {
    id: 'speaker',
    name: 'steam-proof speaker',
    cost: 220,
    description: 'pump lo-fi while decorating or grinding.',
    vibe: 'lo-fi mode',
    image: speakerImg,
    width: 16,
    defaultX: 38,
    defaultY: 18,
    zIndex: 6,
  },
  {
    id: 'candle',
    name: 'lavender candle',
    cost: 140,
    description: 'soft glow for chill-down time after ladders.',
    vibe: 'chill mode',
    image: candleImg,
    width: 10,
    defaultX: 64,
    defaultY: 40,
    zIndex: 5,
  },
  {
    id: 'rubberduck',
    name: 'ShowerBot rubber duck',
    cost: 90,
    description: 'personal hype coach floating by the tub.',
    vibe: 'ShowerBot buddy',
    image: rubberDuckImg,
    width: 12,
    defaultX: 62,
    defaultY: 70,
    zIndex: 6,
  },
]

const hydrateRoomItems = (roomItems?: RoomItemState[]): RoomItem[] => {
  const savedById = new Map((roomItems ?? []).map((item) => [item.id, item]))
  return roomCatalog.map((item) => {
    const saved = savedById.get(item.id)
    const owned = saved?.owned ?? Boolean(item.defaultOwned)
    const placed = saved?.placed ?? owned
    const x = typeof saved?.x === 'number' ? saved.x : item.defaultX
    const y = typeof saved?.y === 'number' ? saved.y : item.defaultY
    return { ...item, owned, placed, x, y }
  })
}

const toPayload = (items: RoomItem[]): RoomItemState[] =>
  items.map((item) => ({ id: item.id, owned: item.owned, placed: item.placed, x: item.x, y: item.y }))

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

function Room({
  onBackToDashboard,
  onGoToLessons,
  onGoToTournaments,
  onGoToContact,
  onGoToSettings,
  onLogout,
}: RoomProps) {
  const [points, setPoints] = useState(0)
  const [items, setItems] = useState<RoomItem[]>(hydrateRoomItems())
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [showShop, setShowShop] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragMoved, setDragMoved] = useState(false)
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const itemsRef = useRef<RoomItem[]>(items)

  const persistLayout = useCallback(
    async (nextItems: RoomItem[]) => {
      if (!userId) {
        setError('Log in to save your layout changes.')
        return
      }
      setSaving(true)
      try {
        const updated = await saveRoomLayout(userId, toPayload(nextItems))
        setPoints(typeof updated.points === 'number' ? updated.points : points)
        setItems(hydrateRoomItems(updated.roomItems))
        setError(null)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || 'Could not save your layout right now.')
        } else {
          setError('Could not save your layout right now.')
        }
      } finally {
        setSaving(false)
      }
    },
    [points, userId],
  )

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const loadUser = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUser(id)
      setPoints(typeof data.points === 'number' ? data.points : 0)
      setItems(hydrateRoomItems(data.roomItems))
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        setError('Log back in to save your bathroom progress.')
      } else {
        setError('Could not load your room right now.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = getStoredUserId()
    if (!stored) {
      setError('Log in to earn points and decorate.')
      setLoading(false)
      return
    }
    setUserId(stored)
    void loadUser(stored)
  }, [loadUser])

  const getPointerPercent = useCallback(
    (event: React.PointerEvent<Element>) => {
      const rect = sceneRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      }
    },
    [],
  )

  const ownedItems = useMemo(() => items.filter((item) => item.owned), [items])
  const shopItems = useMemo(() => items.filter((item) => !item.owned), [items])
  const placedItems = useMemo(() => ownedItems.filter((item) => item.placed), [ownedItems])
  const stashedItems = useMemo(() => ownedItems.filter((item) => !item.placed), [ownedItems])

  const handlePurchase = async (id: string) => {
    if (!userId) {
      setError('Log in to buy bathroom upgrades.')
      return
    }
    const target = items.find((item) => item.id === id)
    if (!target || target.owned || purchasingId) return
    if (target.cost > points) {
      setError('Not enough points yet — keep grinding!')
      return
    }

    setPurchasingId(id)
    try {
      const updatedUser = await purchaseRoomItem(userId, id)
      setPoints(typeof updatedUser.points === 'number' ? updatedUser.points : 0)
      setItems(hydrateRoomItems(updatedUser.roomItems))
      setShowShop(false)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.message === 'string' ? err.message : 'Could not complete purchase.')
      } else {
        setError('Could not complete purchase.')
      }
    } finally {
      setPurchasingId(null)
    }
  }

  const togglePlacement = async (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target || !target.owned) return

    const previous = items
    const next = items.map((item) => (item.id === id ? { ...item, placed: !item.placed } : item))
    setItems(next)
    await persistLayout(next).catch(() => {
      setItems(previous)
    })
  }

  const handlePointerDown = (item: RoomItem) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!item.placed) return
    const coords = getPointerPercent(event)
    if (!coords) return
    const currentX = typeof item.x === 'number' ? item.x : item.defaultX
    const currentY = typeof item.y === 'number' ? item.y : item.defaultY
    setDragOffset({ x: coords.x - currentX, y: coords.y - currentY })
    setDraggingId(item.id)
    setDragMoved(false)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId) return
    const coords = getPointerPercent(event)
    if (!coords) return
    const dragged = itemsRef.current.find((itm) => itm.id === draggingId)
    if (!dragged) return
    const newX = clampPercent(coords.x - dragOffset.x)
    const newY = clampPercent(coords.y - dragOffset.y)
    const startX = typeof dragged.x === 'number' ? dragged.x : dragged.defaultX
    const startY = typeof dragged.y === 'number' ? dragged.y : dragged.defaultY
    if (!dragMoved && (Math.abs(newX - startX) > 0.3 || Math.abs(newY - startY) > 0.3)) {
      setDragMoved(true)
    }
    setItems((prev) =>
      prev.map((itm) => (itm.id === draggingId ? { ...itm, x: newX, y: newY, placed: true } : itm)),
    )
  }

  const handlePointerUp = (event?: React.PointerEvent<Element>) => {
    if (!draggingId) return
    const moved = dragMoved
    setDraggingId(null)
    if (moved) {
      void persistLayout(itemsRef.current)
    }
    if (event) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
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
            {error ? <div className={styles.inlineError}>{error}</div> : null}
          </div>

          <div className={styles.pointsBadge}>
            <div className={styles.pointsNumber}>{loading ? '…' : points}</div>
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

          <div
            className={styles.roomScene}
            ref={sceneRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
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
            <div className={styles.mascot}>
              <img className={styles.mascotImg} src={showerbot} alt="ShowerBot" />
            </div>

            {placedItems.map((item) => (
              <button
                key={item.id}
                className={styles.roomItem}
                type="button"
                style={{
                  left: `${item.x ?? item.defaultX}%`,
                  top: `${item.y ?? item.defaultY}%`,
                  width: `${item.width}%`,
                  zIndex: item.zIndex ?? 3,
                }}
                onPointerDown={handlePointerDown(item)}
                onPointerUp={handlePointerUp}
                title={item.placed ? 'Click to stash' : 'Click to place'}
              >
                <img className={styles.itemImage} src={item.image} alt={item.name} />
                <span
                  className={styles.itemTag}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (draggingId || dragMoved) return
                    void togglePlacement(item.id)
                  }}
                >
                  {item.name}
                </span>
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
                    disabled={purchasingId === item.id || item.cost > points || !userId}
                    onClick={() => handlePurchase(item.id)}
                  >
                    <span className={styles.arrowText}>&gt;</span>{' '}
                    {purchasingId === item.id
                      ? 'working...'
                      : item.cost > points
                        ? 'need points'
                        : 'buy'}
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
                  disabled={saving}
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

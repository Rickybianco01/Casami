import { useState, useRef, useCallback, useEffect, useMemo, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  bodyVariants,
  headVariants,
  tailVariants,
  earLeftVariants,
  earRightVariants,
  eyelidVariants,
  tongueVariants,
  shadowVariants,
  pawVariants,
  zzzVariants,
  type Mood
} from './motion'
import { useVisiblePause } from './useVisiblePause'
import { useThrow } from './useThrow'
import { useGameStore } from './gameStore'
import { Bone } from './Bone'
import { Sparkles } from './Sparkles'
import type { Vec2 } from './physics'
import { it } from '../../../shared/i18n'

interface BiscottoProps {
  size?: number
  mood?: Mood
  wag?: boolean
  className?: string
  onClick?: () => void
  ariaLabel?: string
}

const origin = (x: number, y: number): CSSProperties => ({
  transformBox: 'view-box',
  transformOrigin: `${x}px ${y}px`
})

interface SvgProps {
  size: number
  mood: Mood
  wag: boolean
  hovered: boolean
  visible: boolean
  reduced: boolean
  ariaLabel: string
  onHoverStart: () => void
  onHoverEnd: () => void
  svgRef?: React.Ref<SVGSVGElement>
  flipX?: boolean
}

function BiscottoSvg({
  size,
  mood,
  wag,
  hovered,
  visible,
  reduced,
  ariaLabel,
  onHoverStart,
  onHoverEnd,
  svgRef,
  flipX = false
}: SvgProps) {
  const still = reduced || !visible
  const moodKey: Mood | 'still' = still ? 'still' : mood
  const sleepy = mood === 'sleepy'
  const cheer = mood === 'cheer'
  const tailKey: Mood | 'still' = still || !wag ? 'still' : hovered && !sleepy ? 'cheer' : mood
  const earKey: Mood | 'still' = still ? 'still' : hovered && !sleepy ? 'cheer' : mood
  const tongueKey: 'idle' | 'hidden' =
    still ? 'hidden' : cheer || (hovered && !sleepy) || mood === 'running' || mood === 'jumping' ? 'idle' : 'hidden'
  const eyelidKey: 'open' | 'closed' | 'blink' = sleepy ? 'closed' : still ? 'open' : 'blink'
  const zzzKey: 'show' | 'hide' = sleepy && !still ? 'show' : 'hide'

  return (
    <motion.svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 160 140"
      role="img"
      aria-label={ariaLabel}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      transition={{ type: 'spring', stiffness: 420, damping: 16 }}
      style={{
        overflow: 'visible',
        pointerEvents: 'none',
        transform: flipX ? 'scaleX(-1)' : undefined
      }}
    >
      <defs>
        <radialGradient id="bFur" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#F7DEC6" />
          <stop offset="55%" stopColor="#E0A679" />
          <stop offset="100%" stopColor="#A9683C" />
        </radialGradient>
        <radialGradient id="bBelly" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FCEBD5" />
          <stop offset="100%" stopColor="#F2CEA6" />
        </radialGradient>
        <radialGradient id="bSnout" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFF2DF" />
          <stop offset="100%" stopColor="#EAC9A0" />
        </radialGradient>
        <linearGradient id="bCollar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D8553D" />
          <stop offset="100%" stopColor="#9C3820" />
        </linearGradient>
        <radialGradient id="bTag" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE68A" />
          <stop offset="100%" stopColor="#D89A20" />
        </radialGradient>
      </defs>

      <motion.ellipse
        cx={80}
        cy={132}
        rx={52}
        ry={5}
        fill="#3E2C1F"
        opacity={0.22}
        variants={shadowVariants}
        animate={moodKey}
        style={origin(80, 132)}
      />

      <ellipse cx={54} cy={122} rx={10} ry={7} fill="#A9683C" />
      <ellipse cx={106} cy={122} rx={10} ry={7} fill="#A9683C" />

      <motion.g variants={tailVariants} animate={tailKey} style={origin(128, 90)}>
        <path
          d="M126 90 Q150 70 146 96 Q140 106 128 100 Z"
          fill="url(#bFur)"
          stroke="#8C4E27"
          strokeWidth={0.8}
        />
        <path
          d="M136 80 Q144 74 148 82"
          stroke="#8C4E27"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>

      <motion.g variants={bodyVariants} animate={moodKey} style={origin(80, 108)}>
        <ellipse cx={80} cy={100} rx={50} ry={36} fill="url(#bFur)" />
        <ellipse cx={80} cy={108} rx={30} ry={22} fill="url(#bBelly)" />

        <path d="M44 78 Q80 92 116 78 L116 84 Q80 98 44 84 Z" fill="url(#bCollar)" />
        <circle cx={80} cy={89} r={2.2} fill="#FFD56B" opacity={0.7} />

        <motion.g
          style={origin(80, 90)}
          animate={still ? { rotate: 0 } : { rotate: [0, -10, 0, 8, 0] }}
          transition={still ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect
            x={76}
            y={92}
            width={8}
            height={6}
            rx={1.6}
            fill="url(#bTag)"
            stroke="#8E6514"
            strokeWidth={0.5}
          />
          <circle cx={76} cy={92.8} r={1.3} fill="url(#bTag)" stroke="#8E6514" strokeWidth={0.4} />
          <circle cx={76} cy={97.2} r={1.3} fill="url(#bTag)" stroke="#8E6514" strokeWidth={0.4} />
          <circle cx={84} cy={92.8} r={1.3} fill="url(#bTag)" stroke="#8E6514" strokeWidth={0.4} />
          <circle cx={84} cy={97.2} r={1.3} fill="url(#bTag)" stroke="#8E6514" strokeWidth={0.4} />
        </motion.g>

        <motion.g variants={pawVariants} animate={moodKey} style={origin(60, 124)}>
          <ellipse
            cx={62}
            cy={128}
            rx={11}
            ry={7}
            fill="#E0A679"
            stroke="#8C4E27"
            strokeWidth={0.6}
          />
          <ellipse cx={58} cy={131} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
          <ellipse cx={62} cy={132} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
          <ellipse cx={66} cy={131} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
        </motion.g>
        <motion.g variants={pawVariants} animate={moodKey} style={origin(98, 124)}>
          <ellipse
            cx={98}
            cy={128}
            rx={11}
            ry={7}
            fill="#E0A679"
            stroke="#8C4E27"
            strokeWidth={0.6}
          />
          <ellipse cx={94} cy={131} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
          <ellipse cx={98} cy={132} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
          <ellipse cx={102} cy={131} rx={1.8} ry={1.2} fill="#3E2C1F" opacity={0.45} />
        </motion.g>
      </motion.g>

      <motion.g variants={headVariants} animate={moodKey} style={origin(80, 78)}>
        <motion.g variants={earLeftVariants} animate={earKey} style={origin(54, 30)}>
          <path d="M54 26 Q32 36 46 70 Q56 60 60 44 Z" fill="#8C4E27" />
          <path d="M54 30 Q40 38 48 64 Q56 54 58 46 Z" fill="#B06B3E" />
        </motion.g>
        <motion.g variants={earRightVariants} animate={earKey} style={origin(106, 30)}>
          <path d="M106 26 Q128 36 114 70 Q104 60 100 44 Z" fill="#8C4E27" />
          <path d="M106 30 Q120 38 112 64 Q104 54 102 46 Z" fill="#B06B3E" />
        </motion.g>

        <ellipse cx={80} cy={54} rx={36} ry={32} fill="url(#bFur)" />
        <ellipse cx={80} cy={42} rx={18} ry={11} fill="#F7DEC6" opacity={0.7} />
        <ellipse cx={80} cy={66} rx={22} ry={14} fill="url(#bSnout)" />

        <ellipse cx={58} cy={62} rx={5} ry={3} fill="#F0A8A0" opacity={0.55} />
        <ellipse cx={102} cy={62} rx={5} ry={3} fill="#F0A8A0" opacity={0.55} />

        <ellipse cx={66} cy={50} rx={5.2} ry={6.2} fill="#FFFFFF" />
        <ellipse cx={94} cy={50} rx={5.2} ry={6.2} fill="#FFFFFF" />
        <circle cx={66} cy={51} r={3.6} fill="#2C2320" />
        <circle cx={94} cy={51} r={3.6} fill="#2C2320" />
        <circle cx={67.2} cy={49.4} r={1.2} fill="#FFFFFF" />
        <circle cx={95.2} cy={49.4} r={1.2} fill="#FFFFFF" />

        <motion.rect
          x={60.8}
          y={43.8}
          width={10.4}
          height={12.4}
          fill="#B06B3E"
          variants={eyelidVariants}
          animate={eyelidKey}
          style={origin(66, 43.8)}
        />
        <motion.rect
          x={88.8}
          y={43.8}
          width={10.4}
          height={12.4}
          fill="#B06B3E"
          variants={eyelidVariants}
          animate={eyelidKey}
          style={origin(94, 43.8)}
        />

        {mood === 'thinking' && !still && (
          <>
            <path
              d="M58 40 Q66 36 74 40"
              stroke="#2C2320"
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M86 40 Q94 38 102 42"
              stroke="#2C2320"
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        <g>
          <ellipse cx={80} cy={60} rx={4.8} ry={3.6} fill="#2C2320" />
          <ellipse cx={78.8} cy={58.8} rx={1.4} ry={0.9} fill="#7A665A" />
        </g>
        <path
          d="M80 63.6 L80 68"
          stroke="#2C2320"
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
        />

        {mood === 'happy' || mood === 'cheer' || mood === 'running' || mood === 'jumping' ? (
          <path
            d="M70 68 Q74 76 80 76 Q86 76 90 68"
            stroke="#2C2320"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        ) : mood === 'sleepy' ? (
          <path
            d="M74 70 Q80 68 86 70"
            stroke="#2C2320"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M74 70 Q80 74 86 70"
            stroke="#2C2320"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        )}

        <motion.g variants={tongueVariants} animate={tongueKey} style={origin(80, 74)}>
          <ellipse cx={80} cy={76} rx={5} ry={3.2} fill="#E06B6B" />
          <path
            d="M80 74 L80 78"
            stroke="#C24E4E"
            strokeWidth={0.8}
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </motion.g>

      <motion.text
        x={120}
        y={34}
        fontFamily="Nunito, ui-sans-serif"
        fontSize={14}
        fontWeight={800}
        fill="#B06B3E"
        variants={zzzVariants}
        animate={zzzKey}
      >
        z
      </motion.text>
      <motion.text
        x={128}
        y={22}
        fontFamily="Nunito, ui-sans-serif"
        fontSize={11}
        fontWeight={800}
        fill="#B06B3E"
        variants={zzzVariants}
        animate={zzzKey}
        transition={{ delay: 0.7, duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      >
        z
      </motion.text>
      <motion.text
        x={134}
        y={14}
        fontFamily="Nunito, ui-sans-serif"
        fontSize={9}
        fontWeight={800}
        fill="#B06B3E"
        variants={zzzVariants}
        animate={zzzKey}
        transition={{ delay: 1.4, duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      >
        z
      </motion.text>
    </motion.svg>
  )
}

export function Biscotto({
  size = 120,
  mood = 'happy',
  wag = true,
  className,
  onClick,
  ariaLabel
}: BiscottoProps) {
  const reduced = useReducedMotion() ?? false
  const { ref: svgRef, visible } = useVisiblePause<SVGSVGElement>()
  const [hovered, setHovered] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const idRef = useRef<string>('')
  if (!idRef.current) idRef.current = `bisc-${Math.random().toString(36).slice(2, 10)}`
  const id = idRef.current

  const pointerStartRef = useRef<Vec2 | null>(null)
  const armedRef = useRef(false)
  const ARM_THRESHOLD_PX = 6

  const acquireLock = useGameStore((s) => s.acquireLock)
  const releaseLock = useGameStore((s) => s.releaseLock)
  const activeId = useGameStore((s) => s.activeBiscottoId)
  const incrementCucciolate = useGameStore((s) => s.incrementCucciolate)

  const getAnchor = useCallback((): Vec2 | null => {
    const el = wrapperRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.58 }
  }, [])

  const getViewportBounds = useCallback(() => {
    if (typeof window === 'undefined') return null
    const anchor = getAnchor()
    const groundY = anchor ? anchor.y : window.innerHeight - 80
    return { left: 28, right: window.innerWidth - 28, groundY }
  }, [getAnchor])

  const handleCatch = useCallback(() => {
    void incrementCucciolate()
  }, [incrementCucciolate])

  const { phase, bone, dog, arm, drag, release, cancel, quickThrow } = useThrow({
    getAnchor,
    getViewportBounds,
    onCatch: handleCatch,
    reducedMotion: reduced
  })

  const canStartGame = phase === 'idle' && (activeId === null || activeId === id)

  const gameMood: Mood = useMemo(() => {
    switch (phase) {
      case 'thrown':
      case 'chasing':
      case 'returning':
        return 'running'
      case 'catching':
        return 'jumping'
      case 'missing':
        return 'thinking'
      default:
        return mood
    }
  }, [phase, mood])

  const inlineHidden = phase !== 'idle' && phase !== 'arming'

  useEffect(() => {
    if (phase === 'idle') releaseLock(id)
  }, [phase, id, releaseLock])

  useEffect(() => {
    return () => {
      releaseLock(id)
    }
  }, [id, releaseLock])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.code !== 'Space') return
      if (!canStartGame) return
      const active = document.activeElement as HTMLElement | null
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active && active.isContentEditable)
      )
        return
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const inView =
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      if (!inView) return
      if (!acquireLock(id)) return
      e.preventDefault()
      quickThrow()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [canStartGame, acquireLock, quickThrow, id])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    armedRef.current = false
    if (canStartGame) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start || !canStartGame) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (!armedRef.current) {
      if (dist < ARM_THRESHOLD_PX) return
      if (!acquireLock(id)) {
        pointerStartRef.current = null
        return
      }
      armedRef.current = true
      arm({ x: start.x, y: start.y })
    }
    drag({ x: e.clientX, y: e.clientY })
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start) return
    if (armedRef.current) {
      armedRef.current = false
      release({ x: e.clientX, y: e.clientY })
    } else {
      onClick?.()
    }
  }

  const onPointerCancel = () => {
    pointerStartRef.current = null
    if (armedRef.current) {
      armedRef.current = false
      cancel()
    }
  }

  const armingBone = phase === 'arming' ? getAnchor() : null
  const activeBonePos: Vec2 | null = bone ?? armingBone
  const dogFacingLeft = bone != null && dog != null ? bone.x < dog.x : false

  const effectiveAria = ariaLabel ?? it.mascot.ariaLabel

  const liveMessage =
    phase === 'catching'
      ? it.mascot.caught
      : phase === 'missing'
        ? it.mascot.missed
        : phase === 'chasing' || phase === 'thrown'
          ? it.mascot.chasing
          : phase === 'returning'
            ? it.mascot.returning
            : ''

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    touchAction: 'none',
    userSelect: 'none',
    cursor: onClick || canStartGame ? 'pointer' : 'default'
  }

  const portalNode =
    phase !== 'idle' && typeof document !== 'undefined'
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {inlineHidden && dog && (
              <div
                style={{
                  position: 'absolute',
                  left: dog.x,
                  top: dog.y,
                  transform: 'translate(-50%, -86%)'
                }}
              >
                <BiscottoSvg
                  size={size}
                  mood={gameMood}
                  wag
                  hovered={false}
                  visible
                  reduced={reduced}
                  ariaLabel=""
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                  flipX={dogFacingLeft}
                />
              </div>
            )}
            {activeBonePos && (
              <div
                style={{
                  position: 'absolute',
                  left: activeBonePos.x,
                  top: activeBonePos.y - (phase === 'arming' ? size * 0.5 : 0),
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Bone size={Math.max(28, size * 0.3)} wiggle={phase === 'arming'} />
              </div>
            )}
            {phase === 'catching' && dog && (
              <div
                style={{
                  position: 'absolute',
                  left: dog.x,
                  top: dog.y - size * 0.5,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Sparkles size={Math.max(96, size)} />
              </div>
            )}
          </div>,
          document.body
        )
      : null

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={wrapperStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div style={{ visibility: inlineHidden ? 'hidden' : 'visible' }}>
        <BiscottoSvg
          size={size}
          mood={phase === 'arming' ? 'thinking' : mood}
          wag={wag}
          hovered={hovered}
          visible={visible}
          reduced={reduced}
          ariaLabel={effectiveAria}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          svgRef={svgRef}
        />
      </div>
      {portalNode}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {liveMessage}
      </div>
    </div>
  )
}

export function PawPrintDeco({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx={12} cy={14} r={4} fill="currentColor" />
      <circle cx={28} cy={14} r={4} fill="currentColor" />
      <circle cx={7} cy={24} r={3.5} fill="currentColor" />
      <circle cx={33} cy={24} r={3.5} fill="currentColor" />
      <ellipse cx={20} cy={30} rx={10} ry={7} fill="currentColor" />
    </svg>
  )
}

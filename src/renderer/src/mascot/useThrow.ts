import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PHYSICS,
  GAME_CONSTANTS,
  clampVelocity,
  detectCatch,
  landingTimeMs,
  landingX,
  stepDog,
  trajectory,
  type DogState,
  type ThrowState,
  type Vec2
} from './physics'

export type Phase = 'idle' | 'arming' | 'thrown' | 'chasing' | 'catching' | 'missing' | 'returning'

interface UseThrowArgs {
  getAnchor: () => Vec2 | null
  getViewportBounds: () => { left: number; right: number; groundY: number } | null
  onCatch: () => void
  reducedMotion: boolean
}

interface UseThrowResult {
  phase: Phase
  bone: Vec2 | null
  dog: Vec2 | null
  throwing: boolean
  arm: (pointer: Vec2) => void
  drag: (pointer: Vec2) => void
  release: (pointer: Vec2) => void
  cancel: () => void
  quickThrow: () => void
}

const RETURN_SETTLE_PX = 2
const MISS_WAIT_MS = 700

export function useThrow({
  getAnchor,
  getViewportBounds,
  onCatch,
  reducedMotion
}: UseThrowArgs): UseThrowResult {
  const [phase, setPhase] = useState<Phase>('idle')
  const [bone, setBone] = useState<Vec2 | null>(null)
  const [dog, setDog] = useState<Vec2 | null>(null)

  const throwRef = useRef<ThrowState | null>(null)
  const dogRef = useRef<DogState | null>(null)
  const homeRef = useRef<Vec2 | null>(null)
  const armStartRef = useRef<Vec2 | null>(null)
  const dragEndRef = useRef<Vec2 | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const phaseRef = useRef<Phase>('idle')

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const resetVisual = useCallback(() => {
    stopLoop()
    setBone(null)
    setDog(null)
    throwRef.current = null
    dogRef.current = null
    homeRef.current = null
    armStartRef.current = null
    dragEndRef.current = null
    setPhaseBoth('idle')
  }, [setPhaseBoth, stopLoop])

  const tick = useCallback(
    (nowMs: number) => {
      const tState = throwRef.current
      const dState = dogRef.current
      const home = homeRef.current
      const bounds = getViewportBounds()
      if (!bounds) {
        resetVisual()
        return
      }
      const cfg = { ...DEFAULT_PHYSICS, groundY: bounds.groundY }
      const dt = lastTickRef.current ? nowMs - lastTickRef.current : 16
      lastTickRef.current = nowMs

      const current = phaseRef.current

      if ((current === 'thrown' || current === 'chasing' || current === 'catching') && tState && dState) {
        const pos = trajectory(tState, nowMs, cfg)
        const clampedX = Math.max(bounds.left, Math.min(bounds.right, pos.x))
        setBone({ x: clampedX, y: pos.y })

        const targetX = landingX(tState, cfg)
        const flightMs = landingTimeMs(tState, cfg)
        const elapsed = nowMs - tState.startMs
        const nextDog = stepDog(dState, Math.max(bounds.left, Math.min(bounds.right, targetX)), dt)
        dogRef.current = nextDog
        setDog(nextDog.pos)

        const caught = detectCatch(
          { x: clampedX, y: pos.y },
          { x: nextDog.pos.x, y: nextDog.pos.y - 20 },
          GAME_CONSTANTS.catchRadius
        )
        if (caught) {
          setPhaseBoth('catching')
          stopLoop()
          onCatch()
          setTimeout(() => {
            setPhaseBoth('returning')
            runLoop()
          }, 420)
          return
        }

        if (elapsed >= flightMs) {
          setPhaseBoth('missing')
          stopLoop()
          setTimeout(() => {
            setPhaseBoth('returning')
            runLoop()
          }, MISS_WAIT_MS)
          return
        }
      } else if (current === 'returning' && dState && home) {
        const nextDog = stepDog(dState, home.x, dt)
        dogRef.current = nextDog
        setDog(nextDog.pos)
        if (Math.abs(nextDog.pos.x - home.x) <= RETURN_SETTLE_PX) {
          resetVisual()
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [getViewportBounds, onCatch, resetVisual, setPhaseBoth, stopLoop]
  )

  const runLoop = useCallback(() => {
    stopLoop()
    lastTickRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop, tick])

  const launch = useCallback(
    (velocity: Vec2) => {
      const anchor = getAnchor()
      const bounds = getViewportBounds()
      if (!anchor || !bounds) return

      homeRef.current = anchor
      const clamped = clampVelocity(velocity, GAME_CONSTANTS.maxThrowSpeed)
      throwRef.current = {
        origin: { x: anchor.x, y: anchor.y },
        velocity: clamped,
        startMs: performance.now()
      }
      dogRef.current = { pos: { x: anchor.x, y: anchor.y }, speed: GAME_CONSTANTS.dogSpeed }
      setBone({ x: anchor.x, y: anchor.y })
      setDog({ x: anchor.x, y: anchor.y })

      if (reducedMotion) {
        const cfg = { ...DEFAULT_PHYSICS, groundY: bounds.groundY }
        const tx = Math.max(
          bounds.left,
          Math.min(bounds.right, landingX(throwRef.current, cfg))
        )
        setBone({ x: tx, y: bounds.groundY })
        setDog({ x: tx, y: anchor.y })
        setPhaseBoth('catching')
        onCatch()
        setTimeout(() => resetVisual(), 500)
        return
      }

      setPhaseBoth('thrown')
      runLoop()
    },
    [getAnchor, getViewportBounds, onCatch, reducedMotion, resetVisual, runLoop, setPhaseBoth]
  )

  const arm = useCallback(
    (pointer: Vec2) => {
      if (phaseRef.current !== 'idle') return
      armStartRef.current = pointer
      dragEndRef.current = pointer
      setPhaseBoth('arming')
    },
    [setPhaseBoth]
  )

  const drag = useCallback((pointer: Vec2) => {
    if (phaseRef.current !== 'arming') return
    dragEndRef.current = pointer
  }, [])

  const cancel = useCallback(() => {
    if (phaseRef.current === 'arming') resetVisual()
  }, [resetVisual])

  const release = useCallback(
    (pointer: Vec2) => {
      if (phaseRef.current !== 'arming') return
      const start = armStartRef.current
      if (!start) {
        resetVisual()
        return
      }
      const dx = start.x - pointer.x
      const dy = start.y - pointer.y
      const speed = Math.sqrt(dx * dx + dy * dy) * GAME_CONSTANTS.dragMultiplier
      if (speed < GAME_CONSTANTS.minThrowSpeed) {
        resetVisual()
        return
      }
      const v: Vec2 = {
        x: dx * GAME_CONSTANTS.dragMultiplier,
        y: Math.min(-GAME_CONSTANTS.minThrowSpeed, dy * GAME_CONSTANTS.dragMultiplier)
      }
      launch(v)
    },
    [launch, resetVisual]
  )

  const quickThrow = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    launch({ x: 520, y: -640 })
  }, [launch])

  useEffect(() => {
    return () => {
      stopLoop()
    }
  }, [stopLoop])

  return {
    phase,
    bone,
    dog,
    throwing: phase !== 'idle',
    arm,
    drag,
    release,
    cancel,
    quickThrow
  }
}

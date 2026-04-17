export interface Vec2 {
  x: number
  y: number
}

export interface ThrowState {
  origin: Vec2
  velocity: Vec2
  startMs: number
}

export interface DogState {
  pos: Vec2
  speed: number
}

export interface PhysicsConfig {
  gravity: number
  groundY: number
}

export function trajectory(t: ThrowState, nowMs: number, cfg: PhysicsConfig): Vec2 {
  const dt = Math.max(0, (nowMs - t.startMs) / 1000)
  return {
    x: t.origin.x + t.velocity.x * dt,
    y: t.origin.y + t.velocity.y * dt + 0.5 * cfg.gravity * dt * dt
  }
}

export function landingTimeMs(t: ThrowState, cfg: PhysicsConfig): number {
  const { gravity, groundY } = cfg
  const dy = t.origin.y - groundY
  const disc = t.velocity.y * t.velocity.y - 2 * gravity * dy
  if (disc < 0 || gravity <= 0) return 0
  const root = Math.sqrt(disc)
  const tSec = (-t.velocity.y + root) / gravity
  return Math.max(0, tSec * 1000)
}

export function landingX(t: ThrowState, cfg: PhysicsConfig): number {
  const tMs = landingTimeMs(t, cfg)
  return t.origin.x + t.velocity.x * (tMs / 1000)
}

export function apexTimeMs(t: ThrowState, cfg: PhysicsConfig): number {
  if (cfg.gravity <= 0 || t.velocity.y >= 0) return 0
  return Math.max(0, (-t.velocity.y / cfg.gravity) * 1000)
}

export function stepDog(dog: DogState, targetX: number, dtMs: number): DogState {
  const dx = targetX - dog.pos.x
  const maxStep = dog.speed * (dtMs / 1000)
  const step = Math.max(-maxStep, Math.min(maxStep, dx))
  return {
    ...dog,
    pos: { x: dog.pos.x + step, y: dog.pos.y }
  }
}

export function canIntercept(dog: DogState, t: ThrowState, cfg: PhysicsConfig): boolean {
  const target = landingX(t, cfg)
  const timeBudgetMs = landingTimeMs(t, cfg)
  if (timeBudgetMs <= 0) return false
  const needMs = (Math.abs(target - dog.pos.x) / dog.speed) * 1000
  return needMs <= timeBudgetMs
}

export function detectCatch(bone: Vec2, dogHead: Vec2, radius: number): boolean {
  const dx = bone.x - dogHead.x
  const dy = bone.y - dogHead.y
  return dx * dx + dy * dy <= radius * radius
}

export function clampVelocity(v: Vec2, maxSpeed: number): Vec2 {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y)
  if (mag <= maxSpeed || mag === 0) return v
  const k = maxSpeed / mag
  return { x: v.x * k, y: v.y * k }
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  gravity: 1400,
  groundY: 0
}

export const GAME_CONSTANTS = {
  dogSpeed: 320,
  catchRadius: 42,
  maxThrowSpeed: 1400,
  minThrowSpeed: 160,
  dragMultiplier: 4,
  returnSpeed: 220,
  jumpHeight: 70,
  jumpDurationMs: 360
}

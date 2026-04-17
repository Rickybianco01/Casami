import { motion } from 'framer-motion'

interface SparklesProps {
  size?: number
  className?: string
}

const SPARKS = [
  { angle: -90, distance: 26, delay: 0, r: 3 },
  { angle: -60, distance: 30, delay: 0.02, r: 2.4 },
  { angle: -30, distance: 26, delay: 0.04, r: 2.8 },
  { angle: 0, distance: 32, delay: 0.01, r: 3.2 },
  { angle: 30, distance: 26, delay: 0.05, r: 2.6 },
  { angle: 60, distance: 30, delay: 0.03, r: 2.4 },
  { angle: 90, distance: 26, delay: 0, r: 3 },
  { angle: 120, distance: 28, delay: 0.04, r: 2.6 },
  { angle: 150, distance: 24, delay: 0.02, r: 2.2 },
  { angle: 180, distance: 28, delay: 0.01, r: 2.8 },
  { angle: -120, distance: 28, delay: 0.03, r: 2.6 },
  { angle: -150, distance: 24, delay: 0.05, r: 2.2 }
]

export function Sparkles({ size = 120, className }: SparklesProps) {
  const half = size / 2
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
      style={{ pointerEvents: 'none', overflow: 'visible' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.circle
        cx={half}
        cy={half}
        r={8}
        fill="#FFE58A"
        opacity={0.8}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ transformOrigin: `${half}px ${half}px` }}
      />
      {SPARKS.map((s, idx) => {
        const rad = (s.angle * Math.PI) / 180
        const tx = Math.cos(rad) * s.distance
        const ty = Math.sin(rad) * s.distance
        return (
          <motion.circle
            key={idx}
            cx={half}
            cy={half}
            r={s.r}
            fill={idx % 2 === 0 ? '#F6B24B' : '#FFE58A'}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: tx, y: ty, opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: s.delay }}
          />
        )
      })}
      <motion.path
        d={`M ${half} ${half - 4} l 3 6 l 6 3 l -6 3 l -3 6 l -3 -6 l -6 -3 l 6 -3 z`}
        fill="#FFD56B"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 0], rotate: 120, opacity: [0, 1, 0] }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ transformOrigin: `${half}px ${half}px` }}
      />
    </motion.svg>
  )
}

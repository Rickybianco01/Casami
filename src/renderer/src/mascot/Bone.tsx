import { forwardRef } from 'react'
import { motion } from 'framer-motion'

interface BoneProps {
  size?: number
  className?: string
  ariaHidden?: boolean
  wiggle?: boolean
}

export const Bone = forwardRef<SVGSVGElement, BoneProps>(function Bone(
  { size = 44, className, ariaHidden = true, wiggle = false },
  ref
) {
  return (
    <motion.svg
      ref={ref}
      width={size}
      height={size * 0.6}
      viewBox="0 0 80 48"
      className={className}
      aria-hidden={ariaHidden}
      style={{ overflow: 'visible' }}
      animate={wiggle ? { rotate: [-6, 6, -6] } : { rotate: 0 }}
      transition={wiggle ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <defs>
        <radialGradient id="boneFill" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFF2DA" />
          <stop offset="60%" stopColor="#F2D8A9" />
          <stop offset="100%" stopColor="#C89A5A" />
        </radialGradient>
      </defs>
      <ellipse cx={40} cy={44} rx={22} ry={3} fill="#3E2C1F" opacity={0.18} />
      <path
        d="M16 10 a10 10 0 0 1 16 -4 h16 a10 10 0 0 1 16 4 a10 10 0 0 1 -4 16 a10 10 0 0 1 -4 16 h-16 a10 10 0 0 1 -16 -4 a10 10 0 0 1 -4 -16 a10 10 0 0 1 -4 -12 Z"
        fill="url(#boneFill)"
        stroke="#8E6514"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M24 18 Q40 24 56 18"
        stroke="#B9863F"
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
    </motion.svg>
  )
})

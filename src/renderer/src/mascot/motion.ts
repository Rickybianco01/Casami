import type { Variants, Transition } from 'framer-motion'

export type Mood = 'happy' | 'sleepy' | 'cheer' | 'thinking' | 'running' | 'jumping'

const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1]

export const bodyVariants: Variants = {
  happy: {
    y: [0, -1.2, 0],
    scaleY: [1, 1.015, 1],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
  },
  sleepy: {
    y: [0, 0.4, 0],
    scaleY: [1, 1.02, 1],
    transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
  },
  cheer: {
    y: [0, -6, 0, -4, 0],
    scaleY: [1, 0.96, 1.02, 0.98, 1],
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeOut' }
  },
  thinking: {
    y: [0, -0.6, 0],
    scaleY: [1, 1.01, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  running: {
    y: [0, -3, 0, -2, 0],
    scaleY: [1, 0.98, 1.02, 0.99, 1],
    transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    y: [-2, -6, -2],
    scaleY: [1, 1.04, 1],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { y: 0, scaleY: 1 }
}

export const headVariants: Variants = {
  happy: {
    rotate: [-1.5, 1.5, -1.5],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
  },
  sleepy: {
    rotate: 6,
    y: 2,
    transition: { duration: 1.2, ease: easeOut }
  },
  cheer: {
    rotate: [-3, 3, -3],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
  },
  thinking: {
    rotate: [-8, 8, -8],
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
  },
  running: {
    rotate: [-3, 3, -3],
    y: [0, -1, 0],
    transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    rotate: [-6, -10, -6],
    y: [0, -2, 0],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { rotate: 0, y: 0 }
}

export const tailVariants: Variants = {
  happy: {
    rotate: [-14, 20, -14],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
  },
  sleepy: {
    rotate: [-6, -4, -6],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  cheer: {
    rotate: [-22, 30, -22],
    transition: { duration: 0.32, repeat: Infinity, ease: 'easeInOut' }
  },
  thinking: {
    rotate: [-8, 6, -8],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
  },
  running: {
    rotate: [-24, 34, -24],
    transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    rotate: [20, 36, 20],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { rotate: 0 }
}

export const earLeftVariants: Variants = {
  happy: {
    rotate: [-2, 4, -2],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  sleepy: { rotate: 10, y: 2 },
  cheer: {
    rotate: [-6, 10, -6],
    transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
  },
  thinking: { rotate: -4 },
  running: {
    rotate: [-14, 6, -14],
    transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    rotate: [-18, -6, -18],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { rotate: 0, y: 0 }
}

export const earRightVariants: Variants = {
  happy: {
    rotate: [2, -4, 2],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  sleepy: { rotate: -10, y: 2 },
  cheer: {
    rotate: [6, -10, 6],
    transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
  },
  thinking: { rotate: 4 },
  running: {
    rotate: [14, -6, 14],
    transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    rotate: [18, 6, 18],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { rotate: 0, y: 0 }
}

export const eyelidVariants: Variants = {
  open: { scaleY: 0 },
  closed: { scaleY: 1 },
  blink: {
    scaleY: [0, 0, 1, 0],
    transition: { duration: 0.24, times: [0, 0.8, 0.9, 1], repeat: Infinity, repeatDelay: 3.2 }
  }
}

export const tongueVariants: Variants = {
  idle: { scaleY: [1, 1.1, 1], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } },
  hidden: { scaleY: 0 }
}

export const shadowVariants: Variants = {
  happy: { scaleX: [1, 1.01, 1], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  sleepy: { scaleX: 1.02 },
  cheer: {
    scaleX: [1, 0.82, 1.04, 0.9, 1],
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeOut' }
  },
  thinking: { scaleX: [1, 1.005, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  running: {
    scaleX: [1, 1.06, 0.96, 1.04, 1],
    opacity: [0.22, 0.18, 0.26, 0.2, 0.22],
    transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    scaleX: [1, 0.7, 1],
    opacity: [0.22, 0.1, 0.22],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { scaleX: 1 }
}

export const pawVariants: Variants = {
  happy: { rotate: 0 },
  sleepy: { rotate: 0 },
  cheer: { rotate: 0 },
  thinking: {
    rotate: [0, -8, 0, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.5, 1] }
  },
  running: {
    rotate: [-22, 22, -22],
    transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut' }
  },
  jumping: {
    rotate: [-12, 4, -12],
    transition: { duration: 0.36, ease: 'easeOut' }
  },
  still: { rotate: 0 }
}

export const zzzVariants: Variants = {
  show: {
    opacity: [0, 1, 0],
    y: [-4, -18],
    x: [0, 6],
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeOut' }
  },
  hide: { opacity: 0 }
}

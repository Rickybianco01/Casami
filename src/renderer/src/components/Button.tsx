import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger'
}

const sizeClass: Record<Size, string> = {
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, className, ...rest },
  ref
) {
  const classes = [
    variantClass[variant],
    sizeClass[size],
    block ? 'w-full' : '',
    className || ''
  ]
    .filter(Boolean)
    .join(' ')
  return <button ref={ref} className={classes} {...rest} />
})

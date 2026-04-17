import {
  ShoppingCart,
  Zap,
  PawPrint,
  Heart,
  Car,
  Home,
  Shirt,
  Sparkles,
  Utensils,
  Gift,
  Tag,
  Circle,
  type LucideIcon
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  cart: ShoppingCart,
  bolt: Zap,
  paw: PawPrint,
  heart: Heart,
  car: Car,
  home: Home,
  shirt: Shirt,
  sparkles: Sparkles,
  utensils: Utensils,
  gift: Gift,
  tag: Tag,
  circle: Circle
}

export const ICON_NAMES = Object.keys(ICONS)

export function getIcon(name: string): LucideIcon {
  return ICONS[name] || Tag
}

import { ArrowDownLeft, ArrowUpRight, BookOpen, Bus, Coffee, HeartPulse, House, ShoppingBag, ShoppingCart, Sparkles, WalletCards, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './CategoryIcon.css';

const icons: Record<string, LucideIcon> = {
  Vivienda: House,
  Comida: Coffee,
  Transporte: Bus,
  Salud: HeartPulse,
  Ocio: Sparkles,
  Compras: ShoppingBag,
  Servicios: Zap,
  Educación: BookOpen,
  Sueldo: WalletCards,
  Otros: ShoppingCart,
};

type CategoryIconProps = {
  category: string;
  kind?: 'income' | 'expense';
  compact?: boolean;
};

export function CategoryIcon({
  category,
  kind,
  compact = false,
}: CategoryIconProps) {
  const Icon =
    kind === 'income'
      ? ArrowDownLeft
      : kind === 'expense'
        ? ArrowUpRight
        : icons[category] || ShoppingCart;

  return (
    <span className={`category-icon ${kind || ''} ${compact ? 'compact' : ''}`}>
      <Icon size={compact ? 15 : 18} strokeWidth={1.8} />
    </span>
  );
}

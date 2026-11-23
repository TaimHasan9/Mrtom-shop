import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

interface OthobaLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export default function OthobaLogo({ variant = 'light', size = 'md' }: OthobaLogoProps) {
  const isLight = variant === 'light';
  const boxClass =
    size === 'lg'
      ? 'h-10 w-10'
      : size === 'sm'
      ? 'h-8 w-8'
      : 'h-9 w-9';
  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 18 : 20;
  const titleSize =
    size === 'lg'
      ? 'text-2xl'
      : size === 'sm'
      ? 'text-lg'
      : 'text-xl sm:text-[22px]';

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 shrink-0 whitespace-nowrap focus:outline-none"
      aria-label="Mrtom shop Home"
    >
      <span
        className={`flex ${boxClass} items-center justify-center rounded-xl shadow-xs transition-transform duration-150 group-hover:scale-105 ${
          isLight
            ? 'bg-white text-[#1868b7]'
            : 'bg-[#1868b7] text-white'
        }`}
      >
        <ShoppingBag size={iconSize} strokeWidth={2.3} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`${titleSize} font-extrabold tracking-tight ${
            isLight ? 'text-white' : 'text-[#1868b7]'
          }`}
        >
          Mrtom{' '}
          <span className={isLight ? 'text-[#ffd43b]' : 'text-[#f26522]'}>
            shop
          </span>
        </span>
        <span
          className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${
            isLight ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          Live Easy BD
        </span>
      </span>
    </Link>
  );
}

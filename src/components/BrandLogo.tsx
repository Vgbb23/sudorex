import { BRAND } from '../config/product';

type BrandLogoProps = {
  className?: string;
  variant?: 'white' | 'dark';
  priority?: boolean;
};

export const BrandLogo = ({ className = 'h-9 md:h-10 w-auto', variant = 'white' }: BrandLogoProps) => (
  <span
    className={`inline-flex items-center font-display font-bold uppercase tracking-[0.18em] ${
      variant === 'white' ? 'text-white' : 'text-slate-900'
    } ${className}`}
    aria-label={BRAND.name}
  >
    SUDORE<span className={variant === 'white' ? 'text-[#48A9A6]' : 'text-[#3A8785]'}>X</span>
  </span>
);

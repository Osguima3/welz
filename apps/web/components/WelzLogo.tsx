interface WelzLogoProps {
  class?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function WelzLogo({
  class: className,
  size = 'md',
  showText = true,
}: WelzLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div class={`flex items-center gap-2 ${className ?? ''}`}>
      <div class={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox='0 0 100 100'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          class='w-full h-full'
        >
          <rect width='100' height='100' rx='12' fill='url(#welz-gradient)' />

          <path
            d='M20 30 L30 50 L40 35 L50 75 L60 50 L70 65 L80 25'
            stroke='white'
            strokeWidth='5'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />

          <defs>
            <linearGradient id='welz-gradient' x1='0' y1='0' x2='100' y2='100' gradientUnits='userSpaceOnUse'>
              <stop offset='0%' stopColor='var(--logo-dark, #403E43)' />
              <stop offset='100%' stopColor='var(--logo-blue, #1EAEDB)' />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && <span class='font-bold text-secondary text-xl md:text-2xl'>Welz</span>}
    </div>
  );
}

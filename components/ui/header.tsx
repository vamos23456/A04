'use client';

import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import logo1 from '@/logo/logo1.png';

import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { cn } from '@/lib/utils';

import { useScroll } from './use-scroll';

type HeaderProps = {
  isLight?: boolean;
  onToggleTheme?: () => void;
  onLogin?: () => void;
  onStart?: () => void;
  onNavigateHome?: () => void;
};

type ThemeToggleProps = {
  isLight: boolean;
  onToggleTheme?: () => void;
  subtleButtonClass: string;
  compact?: boolean;
};

function ThemeToggle({ isLight, onToggleTheme, subtleButtonClass, compact = false }: ThemeToggleProps) {
  const id = React.useId();
  const isDark = !isLight;

  return (
    <div className={cn('inline-flex items-center', compact ? 'gap-1' : 'gap-1.5')}>
      <span
        id={`${id}-light`}
        className={cn(
          'cursor-pointer text-left font-medium transition-colors',
          compact ? 'text-[10px]' : 'text-xs',
          isLight ? 'opacity-100' : 'opacity-45',
          isLight ? 'text-black' : 'text-white',
        )}
        aria-controls={id}
        onClick={() => {
          if (!isLight) onToggleTheme?.();
        }}
      >
        <SunIcon className={compact ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      </span>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-labelledby={`${id}-light ${id}-dark`}
        aria-label="Toggle between dark and light mode"
        onClick={onToggleTheme}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border transition-all duration-300',
          compact ? 'h-5.5 w-11 px-1' : 'h-7 w-14 px-1',
          subtleButtonClass,
        )}
      >
        <span
          className={cn(
            'absolute rounded-full bg-current transition-all duration-300',
            compact ? 'h-3.5 w-3.5' : 'h-5 w-5',
            compact ? (isDark ? 'translate-x-[1rem]' : 'translate-x-0') : isDark ? 'translate-x-[1.45rem]' : 'translate-x-0',
          )}
        />
      </button>

      <span
        id={`${id}-dark`}
        className={cn(
          'cursor-pointer text-right font-medium transition-colors',
          compact ? 'text-[10px]' : 'text-xs',
          isDark ? 'opacity-100' : 'opacity-45',
          isDark ? 'text-white' : 'text-black',
        )}
        aria-controls={id}
        onClick={() => {
          if (isLight) onToggleTheme?.();
        }}
      >
        <MoonIcon className={compact ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      </span>
    </div>
  );
}

export function Header({ isLight = false, onToggleTheme, onLogin, onStart, onNavigateHome }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  const links = [
    { label: '功能亮点', href: '#features' },
    { label: '课件展览', href: '#showcase' },
    { label: '关于我们', href: '#about' },
  ];

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const surfaceClass = isLight
    ? 'border-black/10 bg-white/95 text-black backdrop-blur-lg md:top-4 md:max-w-[65rem] shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
    : 'border-white/10 bg-black/72 text-white backdrop-blur-lg md:top-4 md:max-w-[65rem] shadow-[0_16px_40px_rgba(0,0,0,0.28)]';

  const overlayClass = isLight ? 'bg-white border-black/10' : 'bg-black/90 border-white/10';
  const subtleButtonClass = isLight
    ? 'border-black/35 bg-white text-black hover:bg-white/90 hover:text-black'
    : 'border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white';
  const linkClass = isLight
    ? 'text-black/70 hover:bg-black/6 hover:text-black'
    : 'text-white/80 hover:bg-white/8 hover:text-white';

  return (
    <header
      className={cn(
        'pointer-events-auto relative z-50 mx-auto w-full max-w-5xl border border-transparent rounded-[22px] transition-all ease-out',
        {
          [surfaceClass]: scrolled && !open,
          'bg-white/92 border-black/10 backdrop-blur-lg': open && isLight,
          'bg-black/88 border-white/10 backdrop-blur-lg': open && !isLight,
        },
      )}
    >
      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 md:h-12 md:px-5 md:transition-all md:ease-out',
          {
            'md:px-4': scrolled,
          },
        )}
      >
        <img
          src={logo1}
          alt="TDesign.ai"
          className={cn('h-14 w-auto object-contain md:h-16', !isLight && 'invert brightness-0', onNavigateHome && 'cursor-pointer')}
          onClick={onNavigateHome}
        />

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link, i) => (
            onNavigateHome ? (
              <button
                key={i}
                type="button"
                className={buttonVariants({
                  variant: 'ghost',
                  className: linkClass,
                })}
                onClick={onNavigateHome}
              >
                {link.label}
              </button>
            ) : (
              <a
                key={i}
                className={buttonVariants({
                  variant: 'ghost',
                  className: linkClass,
                })}
                href={link.href}
              >
                {link.label}
              </a>
            )
          ))}

          <ThemeToggle isLight={isLight} onToggleTheme={onToggleTheme} subtleButtonClass={subtleButtonClass} />

          <Button variant="outline" className={cn('h-10 rounded-[16px] px-5', subtleButtonClass)} onClick={onLogin}>
            登录
          </Button>
          <Button
            className={cn('h-10 rounded-[16px] px-7', isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90')}
            onClick={onStart}
          >
            开始使用
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle isLight={isLight} onToggleTheme={onToggleTheme} subtleButtonClass={subtleButtonClass} compact />

          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className={subtleButtonClass}
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          'fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
          overlayClass,
          open ? 'block' : 'hidden',
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-2 p-4',
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              onNavigateHome ? (
                <button
                  key={link.label}
                  type="button"
                  className={buttonVariants({
                    variant: 'ghost',
                    className: cn('justify-start', linkClass),
                  })}
                  onClick={() => {
                    setOpen(false);
                    onNavigateHome();
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  className={buttonVariants({
                    variant: 'ghost',
                    className: cn('justify-start', linkClass),
                  })}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className={cn('w-full', subtleButtonClass)} onClick={() => {
              setOpen(false);
              onLogin?.();
            }}>
              登录
            </Button>
            <Button
              className={cn('w-full', isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90')}
              onClick={() => {
                setOpen(false);
                onStart?.();
              }}
            >
              开始使用
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

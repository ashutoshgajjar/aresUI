import React, { useState, useRef, useCallback, useEffect } from 'react';
import "@/assets/css/ripple.css";

const SIZE_DEFAULTS = {
  xs: { px: 'px-2.5', py: 'py-0.5', text: 'text-xs' },
  sm: { px: 'px-3.5', py: 'py-1.5', text: 'text-sm' },
  md: { px: 'px-5', py: 'py-2.5', text: 'text-base' },
  lg: { px: 'px-7', py: 'py-3.5', text: 'text-lg' },
};

export function RippleButton({
  children,
  hue = 225,          // 0 - 360
  saturation = 85,    // 0 - 100
  lightness = 55,     // 0 - 100
  variant = 'solid',  // 'solid' | 'soft' | 'outline' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  rippleDuration = 550,
  disabled = false,
  className = '',
  style = {},
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onKeyDown,
  onKeyUp,
  ...props
}) {
  const [ripples, setRipples] = useState([]);
  const [isHolding, setIsHolding] = useState(false);
  const buttonRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  const spawnRipple = useCallback(
    (clientX, clientY) => {
      if (disabled || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const x = clientX !== null ? clientX - rect.left : rect.width / 2;
      const y = clientY !== null ? clientY - rect.top : rect.height / 2;

      const maxX = Math.max(x, rect.width - x);
      const maxY = Math.max(y, rect.height - y);
      const diameter = Math.hypot(maxX, maxY) * 2.1;

      const id = `${Date.now()}-${Math.random()}`;
      const createdAt = performance.now();

      setIsHolding(true);
      setRipples((prev) => [
        ...prev,
        { id, x, y, diameter, held: true, fading: false, createdAt },
      ]);
    },
    [disabled]
  );

  const releaseRipples = useCallback(() => {
    setIsHolding(false);

    setRipples((prev) =>
      prev.map((ripple) => {
        if (!ripple.held) return ripple;

        const elapsed = performance.now() - ripple.createdAt;
        const minExpandTime = rippleDuration * 0.45;
        const fadeDelay = Math.max(0, minExpandTime - elapsed);
        const fadeOutDuration = 380;

        const fadeTimer = setTimeout(() => {
          setRipples((curr) =>
            curr.map((r) =>
              r.id === ripple.id ? { ...r, held: false, fading: true } : r
            )
          );
        }, fadeDelay);

        const removeTimer = setTimeout(() => {
          setRipples((curr) => curr.filter((r) => r.id !== ripple.id));
        }, fadeDelay + fadeOutDuration);

        timeoutsRef.current.push(fadeTimer, removeTimer);
        return { ...ripple, held: false };
      })
    );
  }, [rippleDuration]);

  const handlePointerDown = (e) => {
    if (e.button === 0) spawnRipple(e.clientX, e.clientY);
    onPointerDown?.(e);
  };

  const handlePointerUp = (e) => {
    releaseRipples();
    onPointerUp?.(e);
  };

  const handlePointerLeave = (e) => {
    if (isHolding) releaseRipples();
    onPointerLeave?.(e);
  };

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && !isHolding) {
      spawnRipple(null, null);
    }
    onKeyDown?.(e);
  };

  const handleKeyUp = (e) => {
    if (e.key === ' ' || e.key === 'Enter') releaseRipples();
    onKeyUp?.(e);
  };

  // Detect if user passed custom Tailwind padding, radius, font-weight, or font-size
  const hasPx = /(?:^|\s)!?p[xlrs]?-\S+/.test(className);
  const hasPy = /(?:^|\s)!?p[ytbe]?-\S+/.test(className);
  const hasTextSize = /(?:^|\s)!?text-(?:xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])(?=\s|$)/.test(className);
  const hasRadius = /(?:^|\s)!?rounded(?:-\S+)?(?=\s|$)/.test(className);
  const hasFontWeight = /(?:^|\s)!?font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?=\s|$)/.test(className);

  const sizePreset = SIZE_DEFAULTS[size] || SIZE_DEFAULTS.md;

  const isLight = lightness >= 65;

  const cssVariables = {
    '--btn-h': hue,
    '--btn-s': `${saturation}%`,
    '--btn-l': `${lightness}%`,
    '--l-dir': isLight ? -1 : 1,
    '--ripple-duration': `${rippleDuration}ms`,
    ...style,
  };

  const resolvedClasses = [
    `focus-visible:outline focus-visible:outline-3 focus-visible:outline-[hsl(var(--btn-h),var(--btn-s),var(--btn-l))]`,
    'ripple-btn',
    `ripple-btn--${variant}`,
    !hasPx && sizePreset.px,
    !hasPy && sizePreset.py,
    !hasTextSize && sizePreset.text,
    !hasRadius && 'rounded-lg',
    !hasFontWeight && 'font-semibold',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      data-held={isHolding}
      data-light={isLight}
      className={resolvedClasses}
      style={cssVariables}
      name={props.name || undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      {...props}
    >
      <span className="ripple-btn__layer" aria-hidden="true">
        {ripples.map((r) => (
          <span
            key={r.id}
            className={[
              'ripple-btn__wave',
              r.held ? 'ripple-btn__wave--held' : '',
              r.fading ? 'ripple-btn__wave--fading' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              width: `${r.diameter}px`,
              height: `${r.diameter}px`,
            }}
          />
        ))}
      </span>
      <span className="ripple-btn__content">{children}</span>
    </button>
  );
}
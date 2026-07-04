import { useEffect, useRef } from 'react';

const MouseTrailer = () => {
  const containerRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const PALETTE = ['#c45d3e', '#2d8686', '#c9a84c', '#d97a5e', '#a384cc'];

  useEffect(() => {
    // Inject custom splash keyframes dynamically
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes paintSplash {
        0% {
          transform: translate3d(-50%, -50%, 0) scale(1);
          opacity: 0.8;
        }
        100% {
          transform: translate3d(calc(-50% + var(--dx)), calc(-50% + var(--dy)), 0) scale(0.1);
          opacity: 0;
        }
      }
      .paint-droplet {
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        z-index: 9998;
        animation: paintSplash 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
    `;
    document.head.appendChild(styleEl);

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      // Update active cursor ring and center dot
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (cursorRingRef.current) {
        // Slow spring follow effect for the outer ring
        cursorRingRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // Calculate distance moved
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spawn paint particle if moved far enough (high sensitivity = fast response)
      if (dist > 12) {
        createPaintParticle(x, y);
        lastPos.current = { x, y };
      }
    };

    const createPaintParticle = (x, y) => {
      if (!containerRef.current) return;

      const droplet = document.createElement('div');
      droplet.className = 'paint-droplet';

      // Random color, size, and splash offsets
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const size = Math.floor(Math.random() * 8) + 4; // 4px to 12px
      const deltaX = (Math.random() * 40 - 20) + 'px';
      const deltaY = (Math.random() * 40 - 20) + 'px';

      // Apply coordinates and style
      droplet.style.left = `${x}px`;
      droplet.style.top = `${y}px`;
      droplet.style.width = `${size}px`;
      droplet.style.height = `${size}px`;
      droplet.style.backgroundColor = color;
      droplet.style.setProperty('--dx', deltaX);
      droplet.style.setProperty('--dy', deltaY);
      droplet.style.filter = 'blur(0.5px)';

      containerRef.current.appendChild(droplet);

      // Clean up DOM after animation completes
      setTimeout(() => {
        droplet.remove();
      }, 700);
    };

    const handleHoverStart = () => {
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform += ' scale(2)';
        cursorRingRef.current.style.borderColor = '#c9a84c';
        cursorRingRef.current.style.backgroundColor = 'rgba(201, 168, 76, 0.1)';
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform += ' scale(0)';
      }
    };

    const handleHoverEnd = () => {
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = cursorRingRef.current.style.transform.replace(' scale(2)', '');
        cursorRingRef.current.style.borderColor = '#c45d3e';
        cursorRingRef.current.style.backgroundColor = 'transparent';
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = cursorDotRef.current.style.transform.replace(' scale(0)', '');
      }
    };

    // Attach listeners to clickable elements
    const attachListeners = () => {
      const clickables = document.querySelectorAll('a, button, [role="button"], input, select, textarea, .card, .hover-tilt');
      clickables.forEach(el => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Periodically re-attach listeners for dynamically loaded content
    const interval = setInterval(attachListeners, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
      styleEl.remove();
    };
  }, []);

  return (
    <div className="hidden lg:block pointer-events-none">
      {/* Dynamic particles container */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9998]" />

      {/* Outer Ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-brand-terracotta z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
        style={{ pointerEvents: 'none' }}
      />

      {/* Center Dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-brand-gold z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default MouseTrailer;

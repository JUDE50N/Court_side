import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FlyingBallOverlay() {
  const [ball, setBall] = useState<{ x: number; y: number; color: string } | null>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStart = (e: any) => {
      setBall(e.detail);
    };

    window.addEventListener('startHtmlBallAnimation', handleStart);
    return () => window.removeEventListener('startHtmlBallAnimation', handleStart);
  }, []);

  useEffect(() => {
    if (!ball || !ballRef.current) return;

    const cartElement = document.querySelector('.cart-icon-target');
    if (!cartElement) return;

    const cartRect = cartElement.getBoundingClientRect();
    const targetX = cartRect.left + cartRect.width / 2;
    const targetY = cartRect.top + cartRect.height / 2;

    const startX = ball.x;
    const startY = ball.y;

    const tl = gsap.timeline({
      onComplete: () => setBall(null)
    });

    // 1. Initial "Separation" - shift to the left
    gsap.set(ballRef.current, { xPercent: -50, yPercent: -50 });
    
    tl.to(ballRef.current, {
      x: -100,
      y: 40,
      rotation: -20,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    // 2. Main flight to cart with shrinking and spinning
    const shiftX = startX; // We keep startX and handle the -100 shift via GSAP x/y
    const shiftY = startY;

    // Recalculate control point based on shifted position (startX - 100, startY + 40)
    const cpX = (startX - 100 + targetX) / 2 + 150;
    const cpY = Math.min(startY + 40, targetY) - 250;

    const animationObj = { t: 0 };

    tl.to(animationObj, {
      t: 1,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!ballRef.current) return;
        const t = animationObj.t;
        
        // Quadratic Bezier formula from shifted position
        const x = Math.pow(1 - t, 2) * (startX - 100) + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * targetX;
        const y = Math.pow(1 - t, 2) * (startY + 40) + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * targetY;
        
        gsap.set(ballRef.current, {
          left: x,
          top: y,
          x: 0,
          y: 0,
          rotation: -20 + (t * 720),
          scale: 1 - (t * 0.85),
          opacity: 1 - (t * 0.7)
        });

        if (t > 0.98) {
          cartElement.classList.add('scale-150');
          setTimeout(() => cartElement.classList.remove('scale-150'), 150);
        }
      }
    });

  }, [ball]);

  if (!ball) return null;

  return (
    <div 
      ref={ballRef}
      className="fixed w-32 h-32 sm:w-48 sm:h-48 rounded-full z-[9999] pointer-events-none overflow-hidden"
      style={{ 
        background: `radial-gradient(circle at 35% 35%, ${ball.color} 0%, #000 100%)`,
        left: `${ball.x}px`,
        top: `${ball.y}px`,
        boxShadow: `
          inset -10px -10px 20px rgba(0,0,0,0.8), 
          inset 10px 10px 20px rgba(255,255,255,0.1),
          0 20px 40px rgba(0,0,0,0.5)
        `,
        border: `1px solid rgba(255,255,255,0.1)`
      }}
    >
      {/* Pebble Texture Simulation */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
        backgroundSize: '4px 4px'
      }} />

      {/* Basketball Ribs */}
      <div className="absolute inset-0 opacity-40" style={{ 
        backgroundImage: `
          linear-gradient(90deg, transparent 48%, #000 50%, transparent 52%),
          linear-gradient(0deg, transparent 48%, #000 50%, transparent 52%)
        `,
        borderRadius: '50%'
      }} />
      
      {/* Curved Ribs */}
      <div className="absolute inset-0 border-[3px] border-black/30 rounded-full scale-[0.7] translate-x-[20%]" />
      <div className="absolute inset-0 border-[3px] border-black/30 rounded-full scale-[0.7] -translate-x-[20%]" />
    </div>
  );
}

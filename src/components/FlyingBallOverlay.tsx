import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FlyingBallOverlay() {
  const [ball, setBall] = useState<{ x: number; y: number; size: number; color: string } | null>(null);
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

    // 1. Setup initial state using GSAP's transform management
    // We use x/y for absolute position and xPercent/yPercent for centering
    gsap.set(ballRef.current, { 
      x: startX,
      y: startY,
      xPercent: -50, 
      yPercent: -50,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)'
    });

    // 2. Straight line flight to cart
    tl.to(ballRef.current, {
      x: targetX,
      y: targetY,
      // Shrink to exactly 1/2 of the icon size (icon is ~20px, so target ~10px)
      scale: 10 / ball.size,
      rotation: 720,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: function() {
        const t = this.progress();
        // Effects: Motion Blur and Pulsing Glow
        const blur = Math.sin(t * Math.PI) * 4;
        const glow = Math.sin(t * Math.PI) * 30;
        
        if (ballRef.current) {
          ballRef.current.style.filter = `blur(${blur}px)`;
          ballRef.current.style.boxShadow = `0 0 ${20 + glow}px ${ball.color}88`;
        }

        if (t > 0.95) {
          cartElement.classList.add('scale-150');
          setTimeout(() => cartElement.classList.remove('scale-150'), 100);
        }
      }
    });

  }, [ball]);

  if (!ball) return null;

  return (
    <div 
      ref={ballRef}
      className="fixed rounded-full z-[9999] pointer-events-none overflow-hidden"
      style={{ 
        width: `${ball.size}px`,
        height: `${ball.size}px`,
        background: `radial-gradient(circle at 35% 35%, ${ball.color} 0%, #000 100%)`,
        left: 0,
        top: 0,
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

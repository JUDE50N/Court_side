import { useRef, useEffect, Suspense, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play } from 'lucide-react';
import { Product } from '../hooks/useProductSlider';
import Basketball3D from './Basketball3D';

interface HeroProps {
  product: Product;
  currentIndex: number;
  totalProducts: number;
  direction: number;
}

export default function Hero({ product, currentIndex, totalProducts, direction }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  
  // Local state to manage the displayed product during transitions
  const [displayProduct, setDisplayProduct] = useState(product);

  // Sync displayProduct on mount or when product changes without direction (initial load)
  useEffect(() => {
    if (direction === 0) {
      setDisplayProduct(product);
    }
  }, [product, direction]);

  useGSAP(() => {
    // Initial Load Sequence
    const tl = gsap.timeline({ delay: 0.4 });

    tl.from(promoRef.current, {
      x: -30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, 0)
    .from(watermarkRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: 1.4,
      ease: "expo.out"
    }, 0.2)
    .from(ballContainerRef.current, {
      y: 120,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out"
    }, 0.4)
    .from(counterRef.current, {
      x: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, 0.6);
  }, { scope: containerRef });

  // Handle "Transform" transitions (no sliding)
  useEffect(() => {
    if (!ballContainerRef.current || !watermarkRef.current || direction === 0) return;

    const tl = gsap.timeline();
    
    // 1. Fade out current watermark
    tl.to(watermarkRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in"
    })
    .call(() => {
      // 2. Update the displayed product halfway
      setDisplayProduct(product);
    })
    // 3. Fade back in with "transform" feel
    .to(watermarkRef.current, {
      scale: 1,
      opacity: 0.07,
      duration: 0.5,
      ease: "expo.out"
    });

    return () => {
      tl.kill();
    };
  }, [product.id, direction]);


  return (
    <div ref={containerRef} className="relative flex-1 flex flex-col sm:flex-row items-center justify-center overflow-visible px-6 sm:px-0 py-2 sm:py-0 min-h-0">
      {/* Radial Glow */}
      <div 
        className="radial-glow transition-all duration-700 opacity-50 sm:opacity-100" 
        style={{ 
          background: `radial-gradient(circle, ${displayProduct.accentColor}26 0%, transparent 70%)` 
        }} 
      />

      {/* Watermark - Repositioned for mobile */}
      <div 
        ref={watermarkRef} 
        className="watermark-text order-2 sm:order-none relative sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 mt-4 sm:mt-0"
      >
        {displayProduct.watermark}
      </div>

      {/* 3D Basketball - order-1 on mobile to be above text */}
      <div id="basketball-3d-container" ref={ballContainerRef} className="relative z-10 flex items-center justify-center order-1 sm:order-none">
        <Suspense fallback={<div className="w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] rounded-full bg-orange-accent/10 animate-pulse" />}>
          <Basketball3D product={displayProduct} />
        </Suspense>
      </div>

      {/* Slide Counter - Repositioned for mobile */}
      <div ref={counterRef} className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-16 flex flex-col items-center gap-2 scale-75 sm:scale-100 origin-right">
        <div className="h-16 sm:h-20 w-[1px] bg-white/10 relative">
          <div 
            className="absolute top-0 left-0 w-full transition-all duration-500" 
            style={{ 
              height: `${((currentIndex + 1) / totalProducts) * 100}%`,
              backgroundColor: displayProduct.accentColor
            }} 
          />
        </div>
        <span 
          className="text-[10px] font-bold rotate-90 mt-6 sm:mt-8 whitespace-nowrap tracking-[0.2em] transition-colors"
          style={{ color: displayProduct.accentColor, opacity: 0.6 }}
        >
          0{currentIndex + 1} / 0{totalProducts}
        </span>
      </div>
    </div>
  );
}

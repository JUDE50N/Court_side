import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../hooks/useProductSlider';
import { cn } from '../lib/utils';

interface BottomBarProps {
  product: Product;
  onNext: () => void;
  onPrev: () => void;
}

export default function BottomBar({ product, onNext, onPrev }: BottomBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isAdded, setIsAdded] = useState(false);

  useGSAP(() => {
    gsap.from(barRef.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 1.2,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev]);

  const handleAddToCart = () => {
    if (isAdded) return;
    setIsAdded(true);
    
    // Dispatch custom event for HTML ball animation from the center of the viewport
    window.dispatchEvent(new CustomEvent('startHtmlBallAnimation', {
      detail: { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2,
        color: product.ballColor 
      }
    }));

    gsap.to('.add-to-cart-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div ref={barRef} className="relative z-50 flex flex-col sm:flex-row items-center sm:items-end justify-between px-6 sm:px-16 pb-6 sm:pb-16 pt-4 sm:pt-10 gap-6 sm:gap-12">
      {/* Price & Info */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:flex-1">
        <div className="hidden sm:block mb-4">
          <h2 className="text-white/40 text-xs font-black tracking-[0.4em] uppercase mb-1">
            {product.watermark}
          </h2>
          <p className="text-white/60 text-sm max-w-md leading-relaxed font-medium">
            {product.description}
          </p>
        </div>
        <span className="text-4xl sm:text-5xl font-black mb-1 sm:mb-2 transition-colors" style={{ color: product.accentColor }}>
          {product.price}
        </span>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
          <span>SIZE: {product.size}</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>{product.type}</span>
        </div>
      </div>

      {/* Button & Navigation Group */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 w-full sm:w-auto">
        {/* Navigation Arrows - Now above the button on all devices */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onPrev}
            className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer group"
            style={{ borderColor: `${product.accentColor}33` }}
          >
            <ChevronLeft size={18} className="group-active:scale-90 transition-transform" style={{ color: product.accentColor }} />
          </button>
          <button 
            onClick={onNext}
            className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer group"
            style={{ borderColor: `${product.accentColor}33` }}
          >
            <ChevronRight size={18} className="group-active:scale-90 transition-transform" style={{ color: product.accentColor }} />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={cn(
            "add-to-cart-btn w-full sm:min-w-[320px] h-12 sm:h-14 rounded-lg font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer text-white text-xs sm:text-sm",
            isAdded 
              ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
              : ""
          )}
          style={{ 
            backgroundColor: isAdded ? undefined : product.accentColor,
            boxShadow: isAdded ? undefined : `0 0 20px ${product.accentColor}4d`
          }}
        >
          {isAdded ? "ADDED ✓" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}
